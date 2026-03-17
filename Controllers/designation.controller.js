const DesignationService = require("../Service/designation.service");

exports.createDesignation = async (req, res) => {
    try {
        const company_id = req.company.id;
        const result = await DesignationService.createDesignation(req.body, company_id);
        res.status(201).json({ 
            success: true, 
            message: "Designation created successfully",
            data: result 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getAllDesignations = async (req, res) => {
    try {
        const company_id = req.company.id;
        const { page = 1, limit = 10 } = req.query;
        const result = await DesignationService.getAllDesignations(company_id, page, limit);
        res.status(200).json({ 
            success: true, 
            message: "Designations fetched successfully",
            ...result 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateDesignation = async (req, res) => {
    try {
        const company_id = req.company.id;
        const result = await DesignationService.updateDesignation(req.params.id, company_id, req.body);
        res.status(200).json({ 
            success: true, 
            message: "Designation updated successfully",
            data: result 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteDesignation = async (req, res) => {
    try {
        const company_id = req.company.id;
        const result = await DesignationService.deleteDesignation(req.params.id, company_id);
        res.status(200).json({ 
            success: true, 
            message: "Designation deleted successfully",
            data: result 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
