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