const fs = require('fs');

const GenericOutputController = require('./GenericOutputController');

class TextOutputController extends GenericOutputController {
    constructor(){
        super();
        
        this.output = [];
        this.results = {};

        this.totalCases = 0;
        this.hospital = 0;
        this.deceased = 0;
        
        this.regionalList = [];
    }

    static describe(){
        return {
            description: 'JSON object with report data for a specific date',
            attributes: {
                // REPORT_TYPE: [
                //     'CASE_REPORT',
                //     'HOSPITAL_REPORT',
                //     'DEATH_REPORT'
                // ]
            }
        }
    }

    generate(dataRetrievalDelegate, targetDate, attributes){
        const _this = this;

        _this.dataRetrievalDelegate = dataRetrievalDelegate;
        _this.targetDate = new Date(targetDate);

        let dateBefore = new Date(_this.targetDate);
        dateBefore.setDate(dateBefore.getDate() - 1);

        let dataSet1 = _this.dataRetrievalDelegate.getData(_this.targetDate);
        let dataSet2 = _this.dataRetrievalDelegate.getData(dateBefore);

        for (const result of dataSet1) {
            let yesterdayData = dataSet2.find(x => x.Municipality_code == result.Municipality_code);
            _this.output.push({
                municipality: result.Municipality_name, 
                currentDay: {    
                    totalReported: parseInt(result.Total_reported),
                    hospitalAdmission: parseInt(result.Hospital_admission), 
                    deceased: parseInt(result.Deceased), 
                },
                
                versusDayBefore: {
                    totalReported: result.Total_reported - yesterdayData.Total_reported, 
                    hospitalAdmission: result.Hospital_admission - yesterdayData.Hospital_admission, 
                    deceased: result.Deceased - yesterdayData.Deceased
                }
            });

            _this.regionalList.push(`${result.Municipality_name}: ${result.Total_reported - yesterdayData.Total_reported} - ${result.Total_reported}`);

            _this.totalCases += result.Total_reported - yesterdayData.Total_reported;
            _this.hospital += result.Hospital_admission - yesterdayData.Hospital_admission;
            _this.deceased += result.Deceased - yesterdayData.Deceased;
        }

        _this.results.totalCasesSinceYesterday = _this.totalCases;
        _this.results.hospitalAdmissionsSinceYesterday = _this.hospital;
        _this.results.deceasedSinceYesteray = _this.deceased;

        let outputData = {
            date: _this.targetDate, 
            output: _this.output, 
            results: _this.results, 
            regionalList: _this.regionalList
        };

        return JSON.stringify(outputData, null, 2);
    }
}

module.exports = TextOutputController;