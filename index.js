require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const CronJob = require('cron').CronJob;

const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

const ReportController = require('./controllers/ReportController');
const ReportTypeApiUtil = require('./controllers/ReportTypeApiUtil');
const PdfController = require('./controllers/PdfController');

const Report = require('./models/Report').model;

const uri = process.env.MONGODB_URI;
// mongoose.set('useFindAndModify', false);
// mongoose.set('useCreateIndex', true);

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, async function(err) {
    if (err) {
        console.log(`[ERROR] Problem while bootstrapping server: ${err.message}`);
        return;
    }
    // const CsvDataConnector = require('./controllers/CsvDataConnector');
    
    let app = express();
    const port = 8080;
    
    const apiUtil = new ReportTypeApiUtil();
    
    app.use(bodyParser.json());
    
    app.use('/output', express.static('output'));
    app.use('/vendor', express.static('node_modules'));
    app.use('/node_modules', express.static('node_modules'));
    app.use('/webapp', express.static('webapp'));
    
    app.get('/', function (req, res) {
        res.sendFile(path.join(__dirname, 'webapp/index.html'));
    });
    
    app.get('/reports/generators', function(req, res){
        
        let apiSpecs = {
            dataConnectors: apiUtil.getDataConnectors(),
            generators: apiUtil.getGenerators()
        }
        
        res.send(apiSpecs);
    });
    
    app.get('/reports/run', function(req, res){
        res.send({
            dataConnector: '',
            date: '',
            reportType: '',
            attributes: {}
        });
    });
    
    app.post('/reports/run', async function(req, res){
        if(apiUtil.hasRequiredParams(req.body)){
            
            let reportController = apiUtil.initReportController(req.body);
            let reportActions = await reportController.build();
            
            res.send(reportActions);
            
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/reports/defaults', async function(req, res){
        await apiUtil.runDefaults();
        res.sendStatus(201);
    });
    
    app.get('/reports', async function(req, res){
        let reports = await Report.find().sort({'date': -1});
        res.send(reports);
    });
    
    app.get('/report/:id', async function(req, res){
        let report = null;
        if(mongoose.isValidObjectId(req.params.id)){
            report = await Report.findById(req.params.id);
        } else {
            report = await Report.findOne({
                uuid: req.params.id
            });
        }
        
        res.send(report);
    });
    
    app.get('/report/:id/content', async function(req, res){
        let report = null;
        if(mongoose.isValidObjectId(req.params.id)){
            report = await Report.findById(req.params.id);
        } else {
            report = await Report.findOne({
                uuid: req.params.id
            });
        }
        
        res.type(report.ext);
        res.send(report.reportContents);
    });
    
    app.get('/report/:id/pdf', async function(req, res){
        let report = null;
        if(mongoose.isValidObjectId(req.params.id)){
            report = await Report.findById(req.params.id);
        } else {
            report = await Report.findOne({
                uuid: req.params.id
            });
        }
        
        if(report){
            let pdfOutput = await PdfController.buildPdfFromReport(report);
            
            res.type('pdf');
            res.send(pdfOutput);
        } else {
            res.sendStatus(404);
        }
        
    });
    
    app.listen(port, function() {
        console.log(`App listening at port ${port}`);
    });
    
    let job = new CronJob('0 20 15 * * *', async function() {
        await apiUtil.runDefaults();
    }, null, true, 'Europe/Amsterdam');
    job.start();
    
});