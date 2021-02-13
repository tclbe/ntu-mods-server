const classSchema = require('./schemas/classSchema');
const indexSchema = require('./schemas/indexSchema');
const moduleInfoSchema = require('./schemas/moduleInfoSchema');
const createConnection = require('../config/mongodb');

let classConn = createConnection('ClassModel');
let indexConn = createConnection('IndexModel');
let moduleInfoConn = createConnection('ModuleInfoModel');

const ClassModel = classConn.model('Class', classSchema, 'classes');
const IndexModel = indexConn.model('Index', indexSchema, 'indexes');
const ModuleInfoModel = moduleInfoConn.model(
  'Module',
  moduleInfoSchema,
  'modules'
);

module.exports = { ClassModel, IndexModel, ModuleInfoModel };
