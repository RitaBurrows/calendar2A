//"use strict";

/*

import { AdvancedFilter, FilterType } from "powerbi-models";
import * as d3 from "d3";
import { select as d3Select, selectAll as d3SelectAll, Selection as D3Selection, } from "d3-selection";
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

import VisualUpdateOptions = powerbiVisualsApi.extensibility.visual.VisualUpdateOptions;
import DataView = powerbiVisualsApi.DataView;
import IVisualHost = powerbiVisualsApi.extensibility.visual.IVisualHost;

import "./../style/visual.less";
import {
    ICalendarDatePeriods,
    ICalendarMargins,
    ICalendarProperties
} from "./interfaces"
import { Utils } from "./utils";
import { 
    DateRange, 
    MonthNames, 
    WeekDay
} from "./calendarTypes"
*/


import powerbiVisualsApi from "powerbi-visuals-api";
import DataView = powerbiVisualsApi.DataView;
import DataViewMetadataColumn = powerbiVisualsApi.DataViewMetadataColumn;
import DataViewPropertyValue = powerbiVisualsApi.DataViewPropertyValue;
import IVisual = powerbiVisualsApi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbiVisualsApi.extensibility.visual.VisualUpdateOptions; 
import IVisualHost = powerbiVisualsApi.extensibility.visual.IVisualHost;
import * as d3 from "d3"; 
import { select as d3Select, selectAll as d3SelectAll, Selection as D3Selection, } from "d3-selection";
import flatpickr from "flatpickr";
import { AdvancedFilter, FilterType } from "powerbi-models"; 
import { Utils } from "./utils";
import "flatpickr/dist/flatpickr.min.css"; 
  

export class Calendar implements IVisual { 

    private calendarContainer: d3.Selection<HTMLDivElement, unknown, null, undefined>;    
    private static dateField: DataViewMetadataColumn | undefined;
    private datesSelected: boolean = false;
    private static dateString: DataViewPropertyValue | undefined
    private dataView: powerbiVisualsApi.DataView;
    private displayCalendar: powerbiVisualsApi.DataViewPropertyValue = 1; 
    private endDate: Date | null = null; 
    private host: IVisualHost;
    private jsonFilters: AdvancedFilter[] = [];
    private options: VisualUpdateOptions;
    public selectedDate: Date | null = null; 
    private startDate: Date | null = null; 
    private rootSelection: d3.Selection<any, any, any, any>; 

    private applyFilter(datefield: any, startDate: Date, endDate: Date) {
        console.log("Calendar applyFilter - startDate, endDate:\n",startDate, endDate)
        if (datefield) {
            // Create filter
            const filter = new AdvancedFilter(
                {
                    table: datefield.queryName.split(".")[0],
                    column: datefield.queryName.split(".")[1]
                },
                "And",
                {
                    operator: "GreaterThanOrEqual",
                    value: startDate.toISOString()
                },
                {
                    operator: "LessThanOrEqual",
                    value: endDate.toISOString()
                });

            this.jsonFilters = [filter];
            this.host.applyJsonFilter(
                filter,
                "general",
                "filter",
                powerbiVisualsApi.FilterAction.merge//this.getFilterAction(this.calendarPeriods.startDate, this.calendarPeriods.endDate)
            );
        }
    }

    
        private renderCalender(dateField: DataViewMetadataColumn, startDate: Date, endDate: Date) :void {
            console.log("Calender renderCalender - startDate, endDate:\n", startDate, endDate)
        
        // initialize Flatpickr inline calendar 
            flatpickr(this.calendarContainer.node(), { 
                inline: true,             // render calendar directly 
                mode: "range",
                defaultDate: [startDate, endDate], 
                dateFormat: "Y-m-d", //CHANGE THIS
                onChange: (selectedDates, dateString, instance) => {
                    const today = new Date();
                    if (selectedDates.length === 2){
                        console.log("Calender renderCalender onChange - dateString:\n", dateString);
                        console.log("Calender renderCalender onChange - selectedDates:\n", selectedDates);
                        this.host.persistProperties({ 
                            merge: [{ 
                                objectName: "sharedDateRange", 
                                selector: null, 
                                properties: { rangeText: dateString } 
                            }]
                        });
                    }
                    if (dateField) {
                    //this.applyFilter(dateField, startDate, endDate);
                    }
                } 
            });
    
        }

    private splitDateString(dateStr: any){
        const dates = dateStr.split(" to ")
        console.log("Calendar splitDateString - dates:\n", dates)
        this.startDate = new Date(dates[0])
        this.endDate = Utils.normaliseEndDate(new Date(dates[1]))
    }

    constructor(options: VisualConstructorOptions) { 
        this.host = options.host;

        // create main container div (inside Power BI visual root) 

        this.rootSelection = d3.select(options.element) 
            .append("div") 
            .style("width", "300px") 
            .style("height", "315px") 
            .style("display", "flex") 
            .style("justify-content", "left") 
            .style("align-items", "top")

        // create calendar container 
        this.calendarContainer = this.rootSelection.append("div") 
            .classed("calendar-inline", true) 
            .style("width", "auto")    // calendar width 
            .style("height", "auto")   // height adjusts automatically
    } 

    public update(options: VisualUpdateOptions) { 
        try {
            
        console.log("Calendar update - options:", options);

        if (!options) {
            console.log("Calendar update: No options available");
            return;
        }
        
        if (!options.dataViews || options.dataViews.length === 0) {
            console.log("Calendar update: No dateViews found");
            return;
        }

        const dataView: DataView = options.dataViews[0];

        Calendar.dateField = dataView.metadata.columns.find(col => col.roles && col.roles["Time"]);
        
        if (!Calendar.dateField) {
            console.log("Calendar update: No dateField found");
            return;
        }
  
        const dateRangetext = dataView.metadata?.objects?.sharedDateRange?.dateString || "2025-09-02 to 2025-09-07" //REMOVE OPTION

        if (!dateRangetext){
            console.log("Calendar update: No dateString found");
            return;
        }

        Calendar.dateString = dateRangetext && dateRangetext as DataViewPropertyValue
        console.log("Calendar update - Calendar.dateString:\n", Calendar.dateString);

        this.splitDateString(Calendar.dateString);
        this.renderCalender(Calendar.dateField, this.startDate, this.endDate);
        this.applyFilter(Calendar.dateField, this.startDate, this.endDate);

        console.log("*** End of Calendar update ***");

        } 
        catch(err){
            console.log(err)
        }
    } 

} 

 