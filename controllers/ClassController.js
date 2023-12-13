
const Tracking = require("../models/Tracking")
const Class = require("../models/Class")


const createClass = async (req, res) => {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Create an array of classes to insert
    const classesToInsert = months.map((month) => ({
        name: `${month}`,
        description: "",
        goal: "",
        tracking: []
    }));

    try {
        // Use insertMany to insert multiple classes
        await Class.insertMany(classesToInsert);
        res.status(201).json({ message: "Created Successfully!" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}


//get classes with name only
const getClasses = async (req, res) => {
    try {
        const classes = await Class.find({}, { name: 1 });
        res.json(classes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const getClassItems = async (req, res) => {
    try {
        const required = req.body.required;
        let classItem;

        if (required === "description") {
            classItem = await Class.findById(req.params.id, { description: 1 });
        } else if (required === "goal") {
            classItem = await Class.findById(req.params.id, { goal: 1 });
        } else if (required === 'tracking') {
            classItem = await Class.findById(req.params.id, { tracking: 1 }).populate("tracking");
        }

        if (!classItem) {
            return res.status(404).json({ message: "Cannot find class" });
        }

        return res.json(classItem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



const createTracking = async (req, res) => {
    try {
        const id = req.params.id
        const classItem = await Class.findById(id);
        if (!classItem) {
            return res.status(404).json({ message: "Cannot find class" });
        }
        let track
        if (req.body.dueDate) {
            track = new Tracking({
                name: req.body.name,
                dueDate: req.body.dueDate
            })
        } else {
            track = new Tracking({
                name: req.body.name
            })
        }
        //add to existing array of items in the model
        const tracking = new Tracking(
            track
        )

        const newTracking = await tracking.save();
        classItem.tracking.push(newTracking._id);
        await classItem.save();
        res.status(201).json({message:"Created!"});
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}


const createTrackingBulk = async (req,res)=>{
    try{
        const id = req.params.id
        const count = req.body.count
        const classItem = await Class.findById(id);
        if (!classItem) {
            return res.status(404).json({ message: "Cannot find class" });
        }
        let tracking = []
        for(let i = 0; i < count; i++){
            tracking.push({
                name: "Class Done"
            })
        }
        const newTracking = await Tracking.insertMany(tracking);
        newTracking.forEach((track)=>{
            classItem.tracking.push(track._id);
        })
        await classItem.save();
        res.status(201).json({message:"Created!"});
    }catch(err){
        res.status(400).json({ message: err.message });
    }

}

const updateClassInfo = async (req, res) => {
    try {
        const id = req.params.id;
        const { description, goal } = req.body;

        const updatedClass = await Class.findById(id);

        if (!updatedClass) {
            return res.status(404).json({ message: 'Class not found' });
        }

        if (description) {
            updatedClass.description = description;
        }
        if (goal) {
            updatedClass.goal = goal;
        }
        await updatedClass.save()
        res.json({ message: "Added Successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateTracking = async (req,res)=>{
    try{
        const id = req.params.id;
        const {isDone, dueDate} = req.body;
        const updatedTracking = await Tracking.findById(id);
        if(!updatedTracking){
            return res.status(404).json({message:"Tracking not found"});
        }
        if(isDone !== null){
            updatedTracking.isDone = isDone;
        }
        if(dueDate !== null){
            updatedTracking.dueDate = dueDate;
        }
        await updatedTracking.save();
        res.json({message:"Updated Successfully!"});
    }catch(err){
        res.status(500).json({ message: err.message });
    }

}

module.exports = {
    createClass,
    createTracking,
    updateClassInfo,
    getClasses,
    createTrackingBulk,
    updateTracking,
    getClassItems
}