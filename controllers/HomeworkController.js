
const Homework = require('../models/Homework');


// Middleware function to get a specific homework by ID
async function getHomeworkById(req, res, next) {
    //get what user what for example subjects or homework
    let id = req.params.id;
    console.log(id)
    let required = req.body.required
    console.log(required)
    let homework;
    try {
        if (required == 'homework') {
            homework = await Homework.findById(id, { homeworks: 1 });
        } else if (required == 'subjects') {
            homework = await Homework.findById(id, { subject: 1 });
        } else {
            homework = await Homework.findById(id);
        }
        if (homework == null) {
            return res.status(404).json({ message: 'Homework not found' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    return res.json(homework);
    next();
}

// CREATE a new homework
async function createHomework(req, res) {
   
    const homework = new Homework({
        level: req.body.level,
    });

    try {
        const newHomework = await homework.save();
        res.status(201).json({message:"Successfully Created!!!"});
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

// READ all homework
async function getAllHomework(req, res) {
    try {
        const homework = await Homework.find({}, { _id: 1, level: 1 });
        res.json(homework);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// UPDATE a homework
async function updateHomework(req, res) {
    if (req.body.level != null) {
        res.homework.level = req.body.level;
    }
    if (req.body.subject != null) {
        res.homework.subject = req.body.subject;
    }
    if (req.body.homework != null) {
        res.homework.homework = req.body.homework;
    }

    try {
        const updatedHomework = await res.homework.save();
        res.json(updatedHomework);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

// DELETE a homework
async function deleteHomework(req, res) {
    let id = req.params.id
    try {
        await Homework.findByIdAndRemove(id);
        res.json({ message: 'Homework deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = {
    createHomework,
    getAllHomework,
    getHomeworkById,
    updateHomework,
    deleteHomework
};
