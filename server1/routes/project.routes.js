// projectRoutes.js
const express = require('express');
const router = express.Router();
const {
    getAllProjects,
    getProjectById,
    getProjectByCode,
    searchProjects,
    createProject,
    updateProject,
    deleteProject
} = require('../controllers/project.controller');

// Get all projects
router.get('/', getAllProjects);

// Search projects
router.get('/search', searchProjects);

// Get project by ID
router.get('/:id', getProjectById);

// Create new project
router.post('/', createProject);

// Update project
router.put('/:id', updateProject);

// Delete project
router.delete('/:id', deleteProject);

module.exports = router;