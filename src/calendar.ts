"use strict";

import powerbiVisualsApi from "powerbi-visuals-api";
import { AdvancedFilter } from "powerbi-models";
import DataView = powerbiVisualsApi.DataView;
import DataViewMetadataColumn = powerbiVisualsApi.DataViewMetadataColumn;
import DataViewPropertyValue = powerbiVisualsApi.DataViewPropertyValue;
import IVisual = powerbiVisualsApi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbiVisualsApi.extensibility.visual.VisualUpdateOptions;
import IVisualHost = powerbiVisualsApi.extensibility.visual.IVisualHost;
import * as d3 from "d3";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import "../style/visual.css"

export class Calendar implements IVisual {

    private calendarContainer: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private static dateField: DataViewMetadataColumn | undefined;
    private static dateString: DataViewPropertyValue | undefined
    private endDate: Date | null = null;
    private host: IVisualHost;
    private jsonFilters: AdvancedFilter[] = [];
    public selectedDate: Date | null = null;
    private startDate: Date | null = null;
    private rootSelection: d3.Selection<any, any, any, any>;

    private applyFilter(datefield: any, startDate: Date, endDate: Date) {
        console.log("Calendar applyFilter - startDate, endDate:\n", startDate, endDate)
        if (datefield) {
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
                powerbiVisualsApi.FilterAction.merge
            );
        }
    }

    private renderCalender(dateField: DataViewMetadataColumn, startDate: Date, endDate: Date): void {
        console.log("Calender renderCalender - startDate, endDate:\n", startDate, endDate)

        // Flatpickr inline calendar 
        flatpickr(this.calendarContainer.node(), {
            inline: true,
            mode: "range",
            defaultDate: [startDate, endDate],
            dateFormat: "Y-m-d",
            onChange: (selectedDates, dateString, instance) => {
                const today = new Date();
                if (selectedDates.length === 2) {
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
            }
        });

    }

    private splitDateString(dateStr: any) {
        const dates = dateStr.split(" to ")
        console.log("Calendar splitDateString - dates:\n", dates)
        this.startDate = new Date(dates[0])
        this.endDate = this.normaliseEndDate(new Date(dates[1]))
    }

    private normaliseEndDate(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
    }

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;

        // main container div inside Power BI visual root 
        this.rootSelection = d3.select(options.element)
            .append("div")
            .classed("calendar-root", true)
            
        this.calendarContainer = this.rootSelection.append("div")
            .classed("calendar-container-inline", true)
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

            const dateRangetext = dataView.metadata?.objects?.sharedDateRange?.dateString || "2025-09-02 to 2025-09-07" //REMOVE '|| "2025-09-02 ...'

            if (!dateRangetext) {
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
        catch (err) {
            console.log(err)
        }
    }
}

