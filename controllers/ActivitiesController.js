
const Subject = require('../models/Subject');
const Activity = require("../models/Activities")
const Lesson = require("../models/Lesson")
const multer = require('multer');
const path = require('path');
const fs = require('fs');


// Set up multer storage for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/activities');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
// Middleware function to fetch a subject by ID and attach it to the request object
const getAllActivities = async (req, res, next) => {
    console.log(req.params.id)
    try {

        let subject = await Subject.findOne({ _id: req.params.id }).select("activities")
            .populate({
                path: 'activities',
                select: "title coverImage description", // Exclude the 'activities' field
            });
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        return res.status(200).json(subject)
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};


//middleware function to return content list of activities of give id
const getActivitiesContentById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { required } = req.body
        let activity;
        if (required === 'lessons') {
            //get get lesson from activity and populate it and select title description and coverImage from lesson
            activity = await Activity.findById(id).select("lessons")
                .populate({
                    path: 'lessons',
                    select: "title description coverImage", // Exclude the 'activities' field
                });
        }
        else if (required === 'homeworks') {
            activity = await Activity.findById(id).select("title homeworks")
        }

        if (!activity) {
            return res.status(404).json({ message: 'Activities not found' });
        }
        return res.status(200).json(activity)
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};


//getMaterialByLesson
const getMaterialByLesson = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { required } = req.body
        let lesson;
        if (required === 'materials') {
            //get get lesson from activity and populate it and select title description and coverImage from lesson
            lesson = await Lesson.findById(id).select("title materials")
        }
        else if (required === 'game') {
            lesson = await Lesson.findById(id).select("title game").populate("game")
                
        }

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        return res.status(200).json(lesson)
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}



// Middleware function to create a new subject
const createActivities = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { title, description } = req.body;
        //get coverImage
        const coverImage = req.file.filename;



        // Find the subject by ID
        const subject = await Subject.findById(id);

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Create a new subject with the given name and coverImage
        const activities = new Activity({
            title,
            description,
            coverImage,
        });
        // Save the subject to the database
        await activities.save();

        // Add the subject's ID to the subject's Subjects array
        subject.activities.push(activities._id);

        // Save the updated subject
        await subject.save();

        res.status(200).json({ message: "Created Successfully!!!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

//middleware function to add material in activity material list
const addLesson = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { title, description } = req.body
        //get coverImage
        const coverImage = req.file.filename;

        // Find the subject by ID
        const activity = await Activity.findById(id);


        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }
        //create new Lesson
        const lesson = new Lesson({
            title,
            description,
            coverImage
        })
        //save lesson
        await lesson.save();
        //push lesson id in activity
        activity.lessons.push(lesson._id);
        await activity.save();
        return res.status(200).json({ message: "Successfully added!!!" })
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

//middleware function to add material in lesson material list
const addMaterial = async (req, res, next) => {
    try {
        const id = req.params.id;
        //get coverImage
        const coverImage = req.file.filename;

        // Find the subject by ID
        const lesson = await Lesson.findById(id);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        lesson.materials.push(coverImage)
        await lesson.save();
        return res.status(200).json({ message: "Successfully added!!!" })
        
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

//remove material from lesson
const removeMaterial = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { filename } = req.body

        // Find the subject by ID
        const lesson = await Lesson.findById(id);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        lesson.materials.pull(filename)
        //also remove from /public/images/activities/${filename}
        const directory = path.join(__dirname, '..', 'public','images','activities',filename)
        fs.unlinkSync(directory);
        await lesson.save();
        return res.status(200).json({ message: "Successfully removed!!!" })
        next();
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Middleware function to update a subject by ID
// const updateSubjectById = async (req, res, next) => {
//     try {
//         const id = req.params.id;
//         const { subject, description } = req.body;
//         //get coverImage
//         const coverImage = req.file.filename;



//         // Find the subject by ID
//         const subject1 = await Subject.findById(id);

//         if (!subject) {
//             return res.status(404).json({ message: 'Subject not found' });
//         }

//         // Create a new subject with the given name and coverImage
//         const newSubject = new Subject({
//             name: subject,
//             description,
//             coverImage,
//         });
//         // Save the subject to the database
//         await newSubject.save();

//         // Add the subject's ID to the subject's Subjects array
//         subject.subjects.push(newSubject._id);

//         // Save the updated subject
//         await subject.save();

//         res.status(200).json({ message: "Created Successfully!!!" });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };


// // Middleware function to delete a subject by ID
// const deleteSubjectById = async (req, res, next) => {
//     try {
//         const subject = req.subject;
//         await subject.remove();
//         res.json({ message: 'Subject deleted successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };
uploadImage = upload.single('coverImage');


module.exports = {
    getAllActivities,
    createActivities,
    getActivitiesContentById,
    addMaterial,
    addLesson,
    removeMaterial,
    getMaterialByLesson,
    uploadImage,
};