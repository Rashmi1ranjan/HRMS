const DepartmentService = require("../Service/department.service");

exports.createDepartment = async (req, res) => {
    try {
        const company_id = req.company.id;
        const result = await DepartmentService.createDepartment(req.body, company_id);
        res.status(201).json({ 
            success: true, 
            message: "Department created successfully",
            data: result 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};




exports.getAllDepartments = async (req, res) =>  {
    try {
        const company_id = req.company.id;
        const { page = 1, limit = 10 } = req.query;
        const result = await DepartmentService.getAllDepartments(company_id, page, limit);
        res.status(200).json({ 
            success: true, 
            message: "Departments fetched successfully",
            ...result 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateDepartment = async (req, res) => {
    try {
        const company_id = req.company.id;
        const result = await DepartmentService.updateDepartment(req.params.id, company_id, req.body);
        res.status(200).json({ 
            success: true, 
            message: "Department updated successfully",
            data: result 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteDepartment = async (req, res) => {
    try {
        const company_id = req.company.id;
        const result = await DepartmentService.deleteDepartment(req.params.id, company_id);
        res.status(200).json({ 
            success: true, 
            message: "Department deleted successfully",
            data: result 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
