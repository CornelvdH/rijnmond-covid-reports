const express = require('express');
const fs = require('fs');
const path = require('path');

const CronJob = require('cron').CronJob;

const CsvDataConnector = require('./controllers/CsvDataConnector');
const ReportController = require('./controllers/ReportController');

function getLatestFileOfType(type){
    const orderRecentFiles = (dir) => {
        return fs.readdirSync(dir)
            .filter((file) => fs.lstatSync(path.join(dir, file)).isFile())
            .filter((file) => path.extname(path.join(dir, file)) == '.' + type)
            .map((file) => ({ 
                file, 
                mtime: fs.lstatSync(path.join(dir, file)).mtime, 
                name: `COVID-19 data van ${file.replace('.txt', '')}`,
                url: `/output/${file}`
            }))
            .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
    };

    const getMostRecentFile = (dir) => {
        const files = orderRecentFiles(dir);
        return files.length ? files[0] : undefined;
    };

    return getMostRecentFile('output');
}

let app = express();
const port = 8080;

app.get('/generate', async function(req, res){
    const reportController = new ReportController();
    await reportController
    .setDataConnector(CsvDataConnector)
    .forToday()
    .setReportType('text')
    .build();
    
    await reportController
    .setDataConnector(CsvDataConnector)
    .forToday()
    .setReportType('json')
    .build();
    
    
    res.sendStatus(200);
});

app.use('/output', express.static('output'));
app.use('/vendor', express.static('node_modules'));
app.use('/node_modules', express.static('node_modules'));
app.use('/webapp', express.static('webapp'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'webapp/index.html'));
});

app.get('/report/latest-text-report', function(req, res) {
    res.redirect(`/output/${getLatestFileOfType('txt').file}`);
});

app.get('/report/latest-json-report', function(req, res) {
    res.send(
        JSON.parse(
            fs.readFileSync('output/' + getLatestFileOfType('json').file).toString()
        )
    );
});


app.get('/reports', function(req, res){
    const orderRecentFiles = (dir) => {
        return fs.readdirSync(dir)
            .filter((file) => fs.lstatSync(path.join(dir, file)).isFile())
            .filter((file) => path.extname(path.join(dir, file)) == '.txt')
            .map((file) => ({ 
                file, 
                mtime: fs.lstatSync(path.join(dir, file)).mtime, 
                name: `COVID-19 data van ${file.replace('.txt', '')}`,
                url: `/output/${file}`
            }))
            .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
    };

    res.send(orderRecentFiles('output'));

});

app.listen(port, function() {
    console.log(`App listening at port ${port}`);
});

let job = new CronJob('0 20 15 * * *', async function() {
    
    const reportController = new ReportController();
    
    await reportController
    .setDataConnector(CsvDataConnector)
    .forToday()
    .setReportType('text')
    .build();
    
    await reportController
    .setDataConnector(CsvDataConnector)
    .forToday()
    .setReportType('json')
    .build();
    
}, null, true, 'Europe/Amsterdam');
job.start();