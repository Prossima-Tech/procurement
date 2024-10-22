const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  projectName: { type: String, required: true, unique: true },
  projectCode: { type: String, required: true, unique: true },
  projectLocation: { type: String, required: true },
  projectStatus: { type: String, default: "Active" },
});

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;