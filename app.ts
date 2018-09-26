import {BotFrameworkAdapter, ConversationState, MemoryStorage} from 'botbuilder';
import * as restify from 'restify';
import { MenuOptionIntentRecognizer } from "./middleware/menuOptionIntentRecognizer"
import { TopMenu } from './dialogs/TopMenu';
import { Payments } from './dialogs/Payments';
import { Cards } from './dialogs/Cards';
import { Accounts } from './dialogs/Accounts';
import { Help } from './dialogs/Help';
import { DialogSet } from 'botbuilder-dialogs';
import { LuisRecognizer } from 'botbuilder-ai'

const luisRecognizer: LuisRecognizer = new LuisRecognizer({
    applicationId: process.env.LUISAppId,
    endpointKey:  process.env.LUISEndpointKey,
    endpoint: process.env.LUISEndpoint,
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


const conversationState = new ConversationState(new MemoryStorage());
// Create a property used to track state.
const dialogState = conversationState.createProperty('dialogState');

//botFrameworkAdapter.use(sentimentAnalysisMiddleware);
botFrameworkAdapter.use(menuOptionIntentRecognizer);

//Creating dialogs
const dialogSet = new DialogSet(dialogState);
dialogSet.add(new TopMenu(conversationState));
dialogSet.add(new Accounts(conversationState));
dialogSet.add(new Payments(conversationState));
dialogSet.add(new Cards(conversationState));
dialogSet.add(new Help(conversationState));


// Events from Microsoft Bot connector
server.post("/api/messages", (request, response) => {
    botFrameworkAdapter.processActivity(request, response, async (context) => {
        const isMessage: boolean = context.activity.type === 'message';

        if (isMessage) {
            // var prop = conversationState.createProperty('prop');
            // prop.set(context,'value');

            
            const dialogContext = await dialogSet.createContext(context);
            
            dialogContext.continueDialog();
                  // Default action
            if (!context.responded && isMessage) {
          
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
                        await dialogContext.beginDialog('Accounts');
                        break;  
                    case "cards":
                        await dialogContext.beginDialog('Cards');
                        break;   
                    case "payments":
                        await dialogContext.beginDialog('Payments');
                        break;   
                    case "help":
                        await dialogContext.beginDialog('Help');
                        break;   
                    case "none":
                        await dialogContext.context.sendActivity(`I did not get that! Replying with main menu`);
                        await dialogContext.beginDialog('TopMenu');
                        break;  
                    default:
                        await dialogContext.context.sendActivity(`I did not get that! Replying with main menu`);
                        await dialogContext.beginDialog('TopMenu');
                        break;  

                }
            }
        }
    });
});
