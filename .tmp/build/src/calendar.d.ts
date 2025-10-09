import powerbiVisualsApi from "powerbi-visuals-api";
import IVisual = powerbiVisualsApi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbiVisualsApi.extensibility.visual.VisualUpdateOptions;
import "flatpickr/dist/flatpickr.min.css";
export declare class Calendar implements IVisual {
    private calendarContainer;
    private static dateField;
    private datesSelected;
    private static dateString;
    private dataView;
    private displayCalendar;
    private endDate;
    private host;
    private jsonFilters;
    private options;
    selectedDate: Date | null;
    private startDate;
    private rootSelection;
    private applyFilter;
    private renderCalender;
    private splitDateString;
    constructor(options: VisualConstructorOptions);
    update(options: VisualUpdateOptions): void;
}
