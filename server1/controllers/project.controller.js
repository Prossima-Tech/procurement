// projectController.js
const Project = require('../models/project.model');
const mongoose = require('mongoose')

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get all projects
const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single project by ID
const getProjectById = async (req, res) => {
    try {
        const idOrCode = req.params.id;
        let project;

        if (isValidObjectId(idOrCode)) {
            // If it's a valid ObjectId, search by _id
            project = await Project.findById(idOrCode);
        } else {
            // If it's not a valid ObjectId, search by projectCode
            project = await Project.findOne({ projectCode: idOrCode });
        }

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProject = async (req, res) => {
    try {
        const idOrCode = req.params.id;
        let project;

        if (isValidObjectId(idOrCode)) {
            project = await Project.findById(idOrCode);
        } else {
            project = await Project.findOne({ projectCode: idOrCode });
        }

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (req.body.projectName) project.projectName = req.body.projectName;
        if (req.body.projectCode) project.projectCode = req.body.projectCode;
        if (req.body.projectLocation) project.projectLocation = req.body.projectLocation;
        if (req.body.projectStatus) project.projectStatus = req.body.projectStatus;

        const updatedProject = await project.save();
        res.json(updatedProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete project by ID or Code
const deleteProject = async (req, res) => {
    try {
        const idOrCode = req.params.id;
        let project;

        if (isValidObjectId(idOrCode)) {
            project = await Project.findById(idOrCode);
        } else {
            project = await Project.findOne({ projectCode: idOrCode });
        }

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        await project.deleteOne();
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Search projects
const searchProjects = async (req, res) => {
    const query = req.query.q || '';
    try {
        const projects = await Project.find({
            $or: [
                { projectName: { $regex: query, $options: 'i' } },
                { projectCode: { $regex: query, $options: 'i' } },
                { projectLocation: { $regex: query, $options: 'i' } }
            ]
        });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new project
const createProject = async (req, res) => {
    const project = new Project({
        projectName: req.body.projectName,
        projectCode: req.body.projectCode,
        projectLocation: req.body.projectLocation,
        projectStatus: req.body.projectStatus || 'Active'
    });

    try {
        const newProject = await project.save();
        res.status(201).json(newProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


module.exports = {
    getAllProjects,
    getProjectById,
    searchProjects,
    createProject,
    updateProject,
    deleteProject
};