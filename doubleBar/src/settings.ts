

module powerbi.extensibility.visual {
    "use strict";
    import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;
    export class CircleSettings {
      public backgroud_bar: string = "#D3D3D3";
      public first_bar: string = "#696969";
      public seconed_bar:string ='#FF0000';
      public text_postive:string ='green';
      public text_negative:string ='red'
      public axis_text_size:number= 12;
      public growth_chart_text:number = 8
   
     }
      export class VisualSettings extends DataViewObjectsParser {
        public Arc: CircleSettings = new CircleSettings();
          }
     
     

}
