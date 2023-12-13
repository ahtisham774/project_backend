
const Subject = require('../models/Subject');
const Activity = require("../models/Activities")
const Lesson = require("../models/Lesson")
const Conversation = require("../models/Conversation")
const ConversationItem = require("../models/ConversationItem")
const Question = require("../models/Question")
const Quiz = require("../models/Quiz")
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

const audioStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/audio');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadAudio = multer({ storage: audioStorage });

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
            lesson = await Lesson.findById(id).select("title games").populate({
                path: 'games',
                populate: {
                    path: 'questions',
                    model: 'Question',
                },
            });
        }

        else if (required === 'conversation') {
            lesson = await Lesson.findById(id).select("conversation").populate({
                path: "conversation",
                populate: {
                    path: "conversations.person1 conversations.person2",
                    model: "ConversationItem",
                },
            });

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


const deleteConversation = async (req, res) => {
    try {
        const conversationId = req.params.id;
        const { conversation_id } = req.body;

        // Use the $pull operator to remove the conversation by ID from the array
        const result = await Conversation.updateOne(
            { _id: conversationId },
            { $pull: { conversations: { _id: conversation_id } } }
        );

        // Check if any modifications were made
        if (result.nModified === 0) {
            return res.status(404).json({ message: 'Conversation not found or not modified' });
        }

        return res.status(200).json({ message: "Successfully deleted!!!" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }

}


const createLessonGame = async (req, res) => {
    try {

        const id = req.params.id
        // Extract lesson data from the request body
        const questions = req.body.questions;
        const type = req.body.gameType

        // Create questions and get their IDs
        const questionIds = await Promise.all(questions.map(async q => {
            const { question, options, correctOption } = q;

            const newQuestion = new Question({
                question,
                options,
                answer: correctOption,
            });

            const savedQuestion = await newQuestion.save();
            return savedQuestion._id;
        }));

        const lesson = await Lesson.findById(id)
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }


        const quiz = new Quiz({
            questions: questionIds,
            type

        });
        const quizId = await quiz.save()
        //make lesson game array unique
        const unique = [...new Set([...lesson.games, quizId._id])];
        lesson.games = unique;
        await lesson.save();
        return res.status(200).json({ message: "Successfully added!!!" })

    } catch (error) {
        console.error('Error creating lesson:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }

}

const updateConversationAudio = async (req, res) => {
    try {
        const id = req.params.id;
        //get coverImage
        const audio = req.file.filename;

        // Find the subject by ID
        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        conversation.audio = audio;
        await conversation.save();
        return res.status(200).json({ message: "Successfully added!!!" })

    }
    catch (error) {
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
async function saveConversationItem({ name, text, translation }) {
    const newItem = new ConversationItem({ name, text, translation });
    return newItem.save();
}

const createConversation = async (req, res) => {
    try {
        const id = req.params.id;
        const title = req.body.title, conversation = JSON.parse(req.body.conversation);
        const audio = req.file.filename;


        const lesson = await Lesson.findById(id);
        if (!lesson) {
            return res.status(404).json({ success: false, message: 'Lesson not found' });
        }

        if (!audio || !title || !conversation) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const conversationIds = [];

        // Parallel creation of ConversationItem instances

        for (const con of conversation) {

            const person1Item = new ConversationItem({
                name: con.person1Name,
                text: con.person1Text,
                translation: con.person1Translation,
            });

            const person2Item = new ConversationItem({
                name: con.person2Name,
                text: con.person2Text,
                translation: con.person2Translation,
            });

            await person1Item.save();
            await person2Item.save();
            conversationIds.push({
                person1: person1Item._id,
                person2: person2Item._id
            });
        }
        console.log(conversationIds)

        const newConversation = new Conversation({
            audio,
            title,
            conversations: conversationIds,
        });

        await newConversation.save();
        lesson.conversation = newConversation._id;
        await lesson.save();

        return res.status(200).json({ message: 'Successfully added!!!' });
    } catch (error) {
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
        const directory = path.join(__dirname, '..', 'public', 'images', 'activities', filename)
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
const deleteQuestion = async (req, res) => {
    try {
        const quizIdToDelete = req.params.quizId;
        const questionIdToDelete = req.params.questionId;



        // Find the Quiz that contains the deleted question
        const quiz = await Quiz.findById(quizIdToDelete);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        // Delete the question from the Question schema
        await Question.findByIdAndDelete(questionIdToDelete);
        // Remove the question's ID from the Quiz schema
        quiz.questions = quiz.questions.filter(id => id !== questionIdToDelete);
        await quiz.save();

        res.status(200).json({ message: 'Question successfully deleted' });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const editGame = async (req, res) => {
    try {
        const quizId = req.params.quizId;
        const updatedQuestions = req.body;
        const quizToEdit = await Quiz.findById(quizId)
        if (!quizToEdit) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Get existing question IDs from the quiz
        const existingQuestionIds = quizToEdit.questions;

        // Process each updated question
        const updatedQuestionIds = await Promise.all(updatedQuestions.map(async q => {
            // Check if q is already in existing questions
            const existingQuestionId = existingQuestionIds.find(id => id == q._id);

            if (existingQuestionId) {
                // Update the existing question
                await Question.findByIdAndUpdate(existingQuestionId, {
                    question: q.question,
                    options: q.options,
                    answer: q.correctOption,
                });
                return existingQuestionId;
            } else {
                // Create a new question
                const { question, options, correctOption } = q;
                const newQuestion = new Question({
                    question,
                    options,
                    answer: correctOption,
                });
                const savedQuestion = await newQuestion.save();
                return savedQuestion._id;
            }
        }));

        // Make the quiz's questions array unique
        const unique = [...new Set([...existingQuestionIds, ...updatedQuestionIds])];
        quizToEdit.questions = unique;
        await quizToEdit.save();

        res.status(200).json({ message: 'Questions successfully edited' });
    } catch (error) {
        console.error('Error editing questions:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = { editGame };


uploadImage = upload.single('coverImage');
audio = uploadAudio.single("audio")


module.exports = {
    getAllActivities,
    createActivities,
    updateConversationAudio,
    createConversation,
    getActivitiesContentById,
    deleteConversation,
    createLessonGame,
    editGame,
    deleteQuestion,
    addMaterial,
    addLesson,
    removeMaterial,
    getMaterialByLesson,
    uploadImage,
    audio

};