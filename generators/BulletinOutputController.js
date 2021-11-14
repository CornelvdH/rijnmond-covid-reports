const fs = require('fs');
const path = require('path');

const GenericOutputController = require('./GenericOutputController');

class BulletinOutputController extends GenericOutputController {
    constructor(){
        super();

        this.totalCases = 0;
        this.hospital = 0;
        this.deceased = 0;
        this.totalCasesYesterday = 0;
        
        this.regionalList = [];
        this.hospitalAdmissionList = [];
        this.deceasedList = [];

        this.getTemplate();
    }

    getTemplate(){
        this.template = fs.readFileSync(path.join(__dirname, '..', 'templates/bulletin-template.html')).toString();
    }

    mergeData(mergeValues){
        let mergedData = this.template;

        for (const mergeKey in mergeValues) {
            if (Object.hasOwnProperty.call(mergeValues, mergeKey)) {
                const element = mergeValues[mergeKey];
                
                mergedData = mergedData.replace(`{{${mergeKey}}}`, element);
            }
        }

        return mergedData;
    }

    transformData(){
        const _this = this;

        let dateBefore = new Date(_this.targetDate);
        dateBefore.setDate(dateBefore.getDate() - 1);

        let dateBeforeYesterday = new Date(_this.targetDate);
        dateBeforeYesterday.setDate(dateBeforeYesterday.getDate() - 2);

        let dataSet1 = _this.dataRetrievalDelegate.getData(_this.targetDate);
        let dataSet2 = _this.dataRetrievalDelegate.getData(dateBefore);
        let dataSet3 = _this.dataRetrievalDelegate.getData(dateBeforeYesterday);

        for (const result of dataSet1) {
            let yesterdayData = dataSet2.find(x => x.Municipality_code == result.Municipality_code);
            let dayBeforeYesterdayData = dataSet3.find(x => x.Municipality_code == result.Municipality_code);

            if(result.Hospital_admission - yesterdayData.Hospital_admission > 0){
                _this.hospitalAdmissionList.push(`${result.Municipality_name} (${result.Hospital_admission - yesterdayData.Hospital_admission})`);
            }

            if(result.Deceased - yesterdayData.Deceased > 0){
                _this.deceasedList.push(`${result.Municipality_name} (${result.Deceased - yesterdayData.Deceased})`);
            }

            _this.regionalList.push(`${result.Municipality_name}: ${result.Total_reported - yesterdayData.Total_reported} - ${result.Total_reported}`);
            
            _this.totalCasesYesterday += yesterdayData.Total_reported - dayBeforeYesterdayData.Total_reported;
            // console.log(_this.totalCasesYesterday);
            _this.totalCases += result.Total_reported - yesterdayData.Total_reported;
            _this.hospital += result.Hospital_admission - yesterdayData.Hospital_admission;
            _this.deceased += result.Deceased - yesterdayData.Deceased;
        }

        // console.log(_this.totalCasesYesterday);

    }

    buildList(list){

        let lastItem = list.pop();
        let result = `${list.join(', ')} en ${lastItem}`;

        return result;
    }

    buildBulletinMessage(){
        const _this = this;

        let merger = {
            title: `RIVM: ${_this.totalCases} nieuwe besmettingen, ${_this.deceased} regiogenoten overleden`,
            lead: `Bij het RIVM zijn in de afgelopen 24 uur ${_this.totalCases} nieuwe coronabesmettingen in onze regio gemeld. Dat zijn er ${_this.totalCases > _this.totalCasesYesterday ? 'meer' : 'minder'} dan gisteren, toen er ${_this.totalCasesYesterday} besmettingen waren gemeld. Er zijn ${_this.deceased} overleden regiogenoten gemeld; ${_this.hospital} mensen werden opgenomen in het ziekenhuis.`,
            regionalData: `De overleden regiogenoten kwamen uit ${_this.buildList(_this.deceasedList)}. In het ziekenhuis werden verder mensen uit ${_this.buildList(_this.hospitalAdmissionList)} opgenomen.`,
            regionalNumbers: _this.regionalList.join("<br>\n")
        }

        return _this.mergeData(merger);
    }

    generate(dataRetrievalDelegate, targetDate, attributes){
        const _this = this;

        _this.targetDate = new Date(targetDate);

        _this.dataRetrievalDelegate = dataRetrievalDelegate;
        // _this.dataSet = _this.dataRetrievalDelegate.getData();
        // console.log(_this.dataSet);

        _this.transformData();
        let output = _this.buildBulletinMessage();

        return output;

        // console.log(dataSet);
    }


}

module.exports = BulletinOutputController;