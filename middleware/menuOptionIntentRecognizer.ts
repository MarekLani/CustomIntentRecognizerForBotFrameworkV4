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
            context.turnState.set(this.cacheKey,invertedMap[context.activity.text]);
        }
        else{
            context.turnState.set(this.cacheKey,undefined);
        }
    }

    /**
     * returns intent value
     * @param context TurnContext
     */
    getIntent(context)
    {
        return context.turnState.get(this.cacheKey);
    }
}