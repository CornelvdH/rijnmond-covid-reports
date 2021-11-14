class GenericOutputController {
    constructor(){

    }

    getDate(date){
        let month = date.getMonth() + 1; // getMonth() is zero-based
        let day = date.getDate();

        return [(day > 9 ? '' : '0') + day, (month > 9 ? '' : '0') + month, date.getFullYear()].join('-');

    }

    // static describe(){
    //     return {
    //         description: 'Baseplate generator type',
    //         attributes: {
    //             type: [
    //                 'CASE_REPORT',
    //                 'HOSPITAL_REPORT',
    //                 'DEATH_REPORT'
    //             ]
    //         }
    //     }
    // }

    // generate(dataRetrievalDelegate, targetDate, attributes){
    //     const _this = this;

    //     _this.targetDate = targetDate;
    //     _this.dataRetrievalDelegate = dataRetrievalDelegate;
    //     _this.dataSet = _this.dataRetrievalDelegate.getData();

    // }
}

module.exports = GenericOutputController;