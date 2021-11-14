const fs = require('fs');
const path = require('path');

const Table = require('cli-table-no-color');
const chars = {'top': '=' , 'top-mid': '=' , 'top-left': '|' , 'top-right': '|', 'bottom': '=' , 'bottom-mid': '=' , 'bottom-left': '|' , 'bottom-right': '|', 'left': '|' , 'left-mid': '|' , 'mid': '-' , 'mid-mid': '-', 'right': '|' , 'right-mid': '|' , 'middle': '|' };

const GenericOutputController = require('./GenericOutputController');

class AverageOutputController extends GenericOutputController {
    constructor(){
        super();
        
        this.resultsTable = new Table({
            head: ['Datum', 'Aantal'],
            colWidths: [20, 20],
            chars: chars
        });

        this.getTemplate();
    }

    getTemplate(){
        this.template = fs.readFileSync(path.join(__dirname, '..', 'templates/average-output.txt')).toString();
    }

    mergeData(mergeValues){
        let mergedData = this.template;

        for (const mergeKey in mergeValues) {
            if (Object.hasOwnProperty.call(mergeValues, mergeKey)) {
                const element = mergeValues[mergeKey];
                
                mergedData = mergedData.replace(`{${mergeKey}}`, element);
            }
        }

        return mergedData;
    }

    getAveragesPerDay(){
        const _this = this;

        let date = new Date(_this.targetDate);
        let amountOfDays = 6; // last week

        for(let i = amountOfDays; i >= 0; i--){

            let currentDate = new Date(date);
            currentDate.setDate(currentDate.getDate() - i);

            let totalCasesPerDay = [];
            let deltaPerDay = [];

            for(let j = amountOfDays + 1; j >= 0; j--){

                let offsetDate = new Date(currentDate);
                offsetDate.setDate(offsetDate.getDate() - j);

                let parseDate = `${new Date(offsetDate).toISOString().split('T')[0]} 10:00:00`;
                totalCasesPerDay.push(_this.dataSet
                    .filter(x => x.Date_of_report == parseDate)
                    .map(x => x.Total_reported)
                    .reduce((prev, next) => parseInt(prev) + parseInt(next)));

            }

            for (let k = 0; k < totalCasesPerDay.length; k++) {
                if(k > 0){
                    const currentElement = totalCasesPerDay[k];
                    const previousElement = totalCasesPerDay[k - 1];
    
                    let delta = currentElement - previousElement;
                    deltaPerDay.push(delta);
                }
            }

            let average = Math.round(deltaPerDay.reduce((a, b) => a + b) / 7);
            _this.resultsTable.push([currentDate.toISOString().split('T')[0], average]);
        }
    }

    generate(dataRetrievalDelegate, targetDate, attributes){
        const _this = this;

        _this.targetDate = new Date(targetDate);

        _this.dataRetrievalDelegate = dataRetrievalDelegate;
        _this.dataSet = _this.dataRetrievalDelegate.getData();

        _this.getAveragesPerDay();

        let outputData = {
            resultsTable: _this.resultsTable.toString()
        };

        let output = _this.mergeData(outputData);

        return output;

    }
}

module.exports = AverageOutputController;