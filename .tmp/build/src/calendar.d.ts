import powerbiVisualsApi from "powerbi-visuals-api";
import IVisual = powerbiVisualsApi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbiVisualsApi.extensibility.visual.VisualUpdateOptions;
import "flatpickr/dist/flatpickr.min.css";
import "../style/visual.css";
export declare class Calendar implements IVisual {
    private calendarContainer;
    private static dateField;
    private static dateString;
    private endDate;
    private host;
    private jsonFilters;
    selectedDate: Date | null;
    private startDate;
    private rootSelection;
    private applyFilter;
    private renderCalender;
    private splitDateString;
    private normaliseEndDate;
    constructor(options: VisualConstructorOptions);
    update(options: VisualUpdateOptions): void;
}
