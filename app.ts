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
