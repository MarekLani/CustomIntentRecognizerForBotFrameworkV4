# Custom Intent Recognizer middleware in Bot Framework v4 (Node.js/Typescript)

This repo contains sample bot application built using Microsoft's Bot Framework V4, which demonstrates how to create custom intent recognizer middleware and how to use it in combination with [LUIS](https://docs.microsoft.com/en-us/azure/cognitive-services/luis/what-is-luis) (Language Understanding Intelligent Service) intent recognizer.  

Sample is using custom intent recognizer, to determine what option has been selected from top menu dialog. To navigate further in the dialog chains users can either choose from the list of menu options or type  command in natural language which gets recognize by LUIS recognizer. 

Custom intent recognizer is used as a middleware, what means that intent gets recognized for every incoming message. If it is undefined, only then we call LUIS recognizer to process incoming message with natural language processing. We use this flow for two reasons. First is, that people tend to use menu and buttons over natural language commands. For buttons we can define specific post back value, which gets recognized by custom intent recognizer and there is no reason to call LUIS recognizer then. Second reason is, that LUIS service is priced based on number of calls, so it makes sense to call it only if really necessary to limit the number of calls. When building chat bots, it is definitely isn't a good pattern to be dependent purely on natural language processing neither is  good pattern to use LUIS recognizer as a part of middleware.

Read about the **middleware** in Bot Framework in [this article](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-concept-middleware?view=azure-bot-service-4.0) within documentation. 

Bellow there are stated few code snippets containing important parts of the intent recognition logic.

***MenuOptions*** class defines map object which maps intents to text values, later used to build up the top menu. It as well defines *InvertMenuOptionsMap* function which returns inverted map, which enables recognizer to do backward mapping from text value send as a post back message. Note that intents defined in *MenuOptionMap* as keys are in pair with intents defined in LUIS application.

```typescript
export class MenuOptions{
   
    MenuOptionsMap:{[key:string]: string} = {
       'payments':'Payments details',
       'accounts': 'Accounts list',
       'cards': 'My cards',
       'help' : 'Need assistance'
    }

   InvertMenuOptionsMap(): any
   {
       let invertedIntentsMap:{[key:string]: string} = {}; 

       for(let intent in this.MenuOptionsMap)
       {
           invertedIntentsMap[this.MenuOptionsMap[intent]] = intent 
       }
       return invertedIntentsMap;
   }
}

export default new MenuOptions();
```

***MenuOptionIntentRecognizer*** class is built as a middleware module. Using inverted map, it tries to detect intent from arriving message. It sets value of intent as a result of middleware processing using "*menuOption*" as a cache key.

```typescript
import {  MiddlewareSet, TurnContext } from "botbuilder";
import MenuOptions from '../dialogs/MenuOptions';

export class MenuOptionIntentRecognizer extends MiddlewareSet{
   
    private cacheKey :Symbol;

    onTurn(context, next): Promise<any> {
        return this.setIntent(context)
            .then(() => next());
    }

    constructor()
    {
        super();
        this.cacheKey = Symbol("menuOption");
    }
   
    /**
     * Recognizes and stores intent
     * @param context TurnContext
     * @param force - force refresh of session token
     */
    async setIntent(context: TurnContext)
    {
        //Check if the value exists as a LuisIntent which we will bypass
        let invertedMap = MenuOptions.InvertMenuOptionsMap()
        if(context.activity.text != undefined && invertedMap[context.activity.text])
        {
            context.services.set(this.cacheKey,invertedMap[context.activity.text]);
        }
        else{
            context.services.set(this.cacheKey,undefined);
        }
    }

    /**
     * returns intent value
     * @param context TurnContext
     */
    getIntent(context)
    {
        return context.services.get(this.cacheKey);
    }
}
```

Main message processing logic is defined in App.ts file. First we create instances of LUIS recognizer and our custom Menu Option Intent Recognizer, which is later added to middleware stack. Notice in message processing logic defined in callback functions of server.post function, how the LUIS recognizer is called only in case the custom recognizer was not capable to recognize the intent ( when user used natural language input) .

```typescript
import {BotFrameworkAdapter, ConversationState, MemoryStorage} from 'botbuilder';
import * as restify from 'restify';
import { MenuOptionIntentRecognizer } from "./middleware/menuOptionIntentRecognizer"
import { TopMenu } from './dialogs/TopMenu';
import { Payments } from './dialogs/Payments';
import { Cards } from './dialogs/Cards';
import { Accounts } from './dialogs/Accounts';
import { Help } from './dialogs/Help';

import { DialogSet } from 'botbuilder-dialogs';
import { LuisRecognizer } from 'botbuilder-ai';

const luisRecognizer: LuisRecognizer = new LuisRecognizer({
    appId: process.env.LUISAppId,
    subscriptionKey: process.env.LUISSubscriptionKey,
    serviceEndpoint: 'https://westeurope.api.cognitive.microsoft.com/' || process.env.LUISEndpoint,
    verbose: true
});

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3879, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Define conversation state shape
interface MyState {
    activeDialog: string;
}

// Create the Bot Framework adapter
const botFrameworkAdapter = new BotFrameworkAdapter({ 
    appId: process.env.MicrosoftAppId, 
    appPassword: process.env.MicrosoftAppPassword 
});

const menuOptionIntentRecognizer = new MenuOptionIntentRecognizer();

// Add conversation state middleware
const conversationState = new ConversationState<MyState>(new MemoryStorage());
botFrameworkAdapter.use(conversationState);
//botFrameworkAdapter.use(sentimentAnalysisMiddleware);
botFrameworkAdapter.use(menuOptionIntentRecognizer);

//Creating dialogs
const dialogSet = new DialogSet();
dialogSet.add('TopMenu', new TopMenu(conversationState));
dialogSet.add('Accounts', new Accounts(conversationState));
dialogSet.add('Payments', new Payments(conversationState));
dialogSet.add('Cards', new Cards(conversationState));
dialogSet.add('Help', new Help(conversationState));


// Events from Microsoft Bot connector
server.post("/api/messages", (request, response) => {
    botFrameworkAdapter.processActivity(request, response, async (context) => {
        const isMessage: boolean = context.activity.type === 'message';

        if (isMessage) {
            const state = conversationState.get(context);
            const dialogContext = dialogSet.createContext(context, state);
            
            if (state.activeDialog && state.activeDialog != '') {
                // Continue the active dialog
                await dialogContext.continue();
            }
            else{
                let intent = undefined; 

                let menuIntent = menuOptionIntentRecognizer.getIntent(context)
                if(menuIntent != undefined)
                {
                    intent = menuIntent;
                }
                else
                {
                    let luisResult = await luisRecognizer.recognize(context);
                    intent = LuisRecognizer.topIntent(luisResult);
                }
                switch (intent) {
                    case "accounts":
                        state.activeDialog = 'Accounts';
                        await dialogContext.begin('Accounts');
                        break;  
                    case "cards":
                        state.activeDialog = 'Cards';
                        await dialogContext.begin('Cards');
                        break;   
                    case "payments":
                        state.activeDialog = 'Payments';
                        await dialogContext.begin('Payments');
                        break;   
                    case "help":
                        state.activeDialog = 'Help';
                        await dialogContext.begin('Help');
                        break;   
                    case "none":
                        await dialogContext.context.sendActivity(`I did not get that! Replying with main menu`);
                        state.activeDialog = 'TopMenu';
                        await dialogContext.begin('TopMenu');
                        break;  
                }
            }

            if (!context.responded) {
                 if (!context.responded && isMessage) {
                    state.activeDialog = 'TopMenu';
                    await dialogContext.begin('TopMenu');
                }
            }
        }
    });
});

```



## Summary

In this sample we demonstrate how to use custom intent recognizer, to recognize intents for messages sent as a post back actions after user clicked buttons in the menu. It definitely is not a good practice to utilize LUIS also for recognition of intents for predefined messages set as button values and you should always rather have your own custom recognizer for doing that. This way you do not have to touch your LUIS model every time you decide to change the menu options and mainly you limit number of calls being sent to LUIS. We set custom recognizer as a part of middleware, as our conversation flow contains main menu in every message being sent to user. If this is not your case, you can built intent recognizer which is not part of middleware pipeline and use it same way as we used Luis Recognizer and use it only "on demand".