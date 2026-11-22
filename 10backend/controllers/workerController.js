import * as workerService from '../services/workerService.js';

export const fetchAllWorkers = async (req, res) => {
    try {
        const workers = await workerService.fetchAllWorkers();
        res.status(200).json(workers);
    } catch (e) {
        console.log(e);
        res.status(e.statusCode || 500).json({
            error: e.message
        });
    }
}

/* Register */
export const registerWorker = async (req, res) => {
    const { name } = req.body;

    try {
        const worker = await workerService.registerWorker({ name });
        res.status(201).json({
            success: true,
            worker
        });
    } catch (e) {
        console.log(e);
        res.status(e.statusCode || 500).json({
            error: e.message
        });
    }
}

/* Delete */
export const deleteWorker = async (req, res) => {
    const { workerId } = req.params;

    try {
        const message = await workerService.deleteWorker(workerId);
        res.status(200).json({
            success: true,
            message
        });
    } catch (e) {
        console.log(e);
        res.status(e.statusCode || 500).json({
            error: e.message
        });
    }
}