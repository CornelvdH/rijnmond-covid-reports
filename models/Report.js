const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportSchema = new Schema({
    date: Date,
    ext: String,
    uuid: String,
    fileName: String,
    reportType: String,
    fileSize: Number,
    reportContents: String,
    attributes: [Object]
}, {
    collection: 'reports',
    timestamps: true
});

ReportSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.reportContents;
    return obj;
}

const Report = mongoose.model('Report', ReportSchema, 'reports');

module.exports = {
    schema: ReportSchema,
    model: Report
};