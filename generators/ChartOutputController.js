const fs = require('fs');
const path = require('path');

const GenericOutputController = require('./GenericOutputController');

class ChartOutputController extends GenericOutputController {
    constructor(){
        super();
        
        this.getTemplate();
    }

    static describe(){
        return {
            description: 'Charts that display report data over time',
            attributes: {
                type: [
                    'CASE_REPORT',
                    'HOSPITAL_REPORT',
                    'DEATH_REPORT'
                ],
                daysBefore: 30
            }
        }
    }

    getTemplate(){
        this.template = fs.readFileSync(path.join(__dirname, '..', 'templates/chart-template.html')).toString();
    }

    mergeData(mergeValues){
        let mergedData = this.template;

        for (const mergeKey in mergeValues) {
            if (Object.hasOwnProperty.call(mergeValues, mergeKey)) {
                const element = mergeValues[mergeKey];
                
                mergedData = mergedData.replace(`<${mergeKey}>`, JSON.stringify(element, null, 2));
            }
        }

        return mergedData;
    }

    parseData(){
        const _this = this;
        let now = new Date();

        let dataObject = {
            labels: [],
            values: []
        }

        let deltaPerDay = [];
        let avgPerDay = [];
        let dayLabels = [];
        let totalCasesPerDay = [];

        for(let d = _this.targetDate; d <= now; d.setDate(d.getDate() + 1)){
            let parseDate = `${new Date(d).toISOString().split('T')[0]} 10:00:00`;

            dayLabels.push(_this.getDate(d));

            if(_this.municipality){
                totalCasesPerDay.push(_this.dataSet
                    .filter(x => x.Date_of_report == parseDate)
                    .filter(x => x.Municipality_name == _this.municipality)
                    .map(x => x.Total_reported)
                    .reduce((prev, next) => parseInt(prev) + parseInt(next)));
            } else {
                totalCasesPerDay.push(_this.dataSet
                    .filter(x => x.Date_of_report == parseDate)
                    .map(x => x.Total_reported)
                    .reduce((prev, next) => parseInt(prev) + parseInt(next)));
            }
            
        }

        for (let i = 0; i < totalCasesPerDay.length; i++) {
            if(i > 0){
                const currentElement = totalCasesPerDay[i];
                const previousElement = totalCasesPerDay[i - 1];

                let delta = currentElement - previousElement;
                deltaPerDay.push(delta);
            }
        }

        for (let i = 0; i < deltaPerDay.length; i++) {
            const delta = deltaPerDay[i];
            if(i > 2){
                const prev1 = deltaPerDay[i - 1];
                const prev2 = deltaPerDay[i - 2];

                avgPerDay.push(Math.round((delta + prev1 + prev2) / 3));
            } else {
                avgPerDay.push(delta);
            }
        }

        dayLabels.shift();

        dataObject.labels = dayLabels;
        dataObject.values = deltaPerDay;
        dataObject.averages = avgPerDay;

        return dataObject;

    }

    buildChart(){

        let dataItems = this.parseData();

        let mergeValues = {
            labels: dataItems.labels,
            dataSets: [{
                type: 'bar',
                label: 'Aantal COVID-cases',
                backgroundColor: 'rgb(128, 181, 214)',
                borderColor: 'rgb(128, 181, 214)',
                data: dataItems.values,
                // tension: 0.2
            }, {
                type: 'line',
                label: 'Aantal COVID-cases (gemiddelde over 3 dagen)',
                backgroundColor: 'rgb(0, 107, 172)',
                borderColor: 'rgb(0, 107, 172)',
                data: dataItems.averages,
                tension: 0.5
            }]
        }

        let output = this.mergeData(mergeValues);
        return output;
    }

    generate(dataRetrievalDelegate, targetDate, attributes){
        const _this = this;

        _this.targetDate = new Date(targetDate);
        _this.targetDate.setDate(_this.targetDate.getDate() - attributes[0].daysBefore);
        _this.municipality = attributes[0].municipality;

        _this.dataRetrievalDelegate = dataRetrievalDelegate;
        _this.dataSet = _this.dataRetrievalDelegate.getData();

        // console.log(_this.dataSet);

        let output = _this.buildChart();

        return output;

        // console.log(dataSet);
    }
}

module.exports = ChartOutputController;