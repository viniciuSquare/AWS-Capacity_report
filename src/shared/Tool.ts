export class ToolsKit {
    static groupBy = (key: any) => (array: any) =>
        array.reduce(
            (objectsByKeyValue: { [x: string]: any; }, obj: { [x: string]: string | number; }) => ({
                ...objectsByKeyValue,
                [obj[key]]: (objectsByKeyValue[obj[key]] || []).concat(obj)
            }),
            {}
        );
}