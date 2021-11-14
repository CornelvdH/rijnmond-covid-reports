const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConfigSchema = new Schema({
    name: String,
    value: String
}, {
    collection: 'configs',
    timestamps: true
});

ConfigSchema.virtual('configObject').get(function(){
    let returnValue = null;

    try {
        returnValue = JSON.parse(this.value);
    } catch(e){
        
        returnValue = this.value;
    }

    return returnValue;
});

ConfigSchema.set('toJSON', {virtuals: true});

const Config = mongoose.model('Config', ConfigSchema, 'configs');

module.exports = {
    schema: ConfigSchema,
    model: Config
};