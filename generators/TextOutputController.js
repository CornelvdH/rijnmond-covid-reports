const fs = require('fs');
const path = require('path');

const Table = require('cli-table-no-color');
const chars = {'top': '=' , 'top-mid': '=' , 'top-left': '|' , 'top-right': '|', 'bottom': '=' , 'bottom-mid': '=' , 'bottom-left': '|' , 'bottom-right': '|', 'left': '|' , 'left-mid': '|' , 'mid': '-' , 'mid-mid': '-', 'right': '|' , 'right-mid': '|' , 'middle': '|' };

class TextOutputController {
    constructor(){
        this.outputTable = new Table({
            head: ['Gemeente', 'V: C', 'V: Z', 'V: O', 'G: C', 'G: Z', 'G: O'],
            colWidths: [40, 10, 10, 10, 10, 10, 10],
            chars: chars
        });
        
        this.resultsTable = new Table({
            head: ['', 'Aantal'],
            colWidths: [51, 21],
            chars: chars
        });

        this.totalCases = 0;
        this.hospital = 0;
        this.deceased = 0;
        
        this.regionalList = [];

        this.getTemplate();
    }

    getTemplate(){
        this.template = fs.readFileSync(path.join(__dirname, '..', 'templates/text-output.txt')).toString();
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

    generate(dataRetrievalDelegate, targetDate){
        const _this = this;

        _this.dataRetrievalDelegate = dataRetrievalDelegate;
        _this.targetDate = targetDate;

        let dateBefore = new Date(_this.targetDate);
        dateBefore.setDate(dateBefore.getDate() - 1);

        let dataSet1 = _this.dataRetrievalDelegate.getData(_this.targetDate);
        let dataSet2 = _this.dataRetrievalDelegate.getData(dateBefore);

        for (const result of dataSet1) {
            let yesterdayData = dataSet2.find(x => x.Municipality_code == result.Municipality_code);
            _this.outputTable.push(
                [
                    result.Municipality_name, 
                    
                    result.Total_reported, 
                    result.Hospital_admission, 
                    result.Deceased, 
                    
                    result.Total_reported - yesterdayData.Total_reported, 
                    result.Hospital_admission - yesterdayData.Hospital_admission, 
                    result.Deceased - yesterdayData.Deceased
                ]
            );

            _this.regionalList.push(`${result.Municipality_name}: ${result.Total_reported - yesterdayData.Total_reported} - ${result.Total_reported}`);

            _this.totalCases += result.Total_reported - yesterdayData.Total_reported;
            _this.hospital += result.Hospital_admission - yesterdayData.Hospital_admission;
            _this.deceased += result.Deceased - yesterdayData.Deceased;
        }

        _this.resultsTable.push(['Aantal cases sinds gisteren', _this.totalCases]);
        _this.resultsTable.push(['Aantal ziekenhuisopnames sinds gisteren', _this.hospital]);
        _this.resultsTable.push(['Aantal overleden', _this.deceased]);

        let outputData = {
            date: _this.targetDate.toLocaleDateString('nl-NL'), 
            outputTable: _this.outputTable.toString(), 
            resultsTable: _this.resultsTable.toString(), 
            regionalList: _this.regionalList.join('\n')
        };

        let output = _this.mergeData(outputData);

        return output;
    }
}

module.exports = TextOutputController;