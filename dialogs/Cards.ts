import { DialogContainer} from 'botbuilder-dialogs';
import TopMenu = require("./TopMenu");

export class Cards extends DialogContainer {
    constructor(conversationState) {
        // Dialog ID of 'Help' will start when class is called in the parent
        super('Cards');

        //add child dialogs
        this.dialogs.add('TopMenu', new TopMenu.TopMenu(conversationState));

        // Defining the conversation flow using a waterfall model
        this.dialogs.add('Cards', [     
            async function (dc, results){
                await dc.context.sendActivity(`You've reached cards dialog`);
                
                const state = conversationState.get(dc.context);
                state.activeDialog = 'TopMenu';
                await dc.replace("TopMenu");
            }                 
        ]);
    }
}