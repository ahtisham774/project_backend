
const StudentGoals = require('../models/StudentGoals');


exports.assignGoals = async (req, res) => {
    try {
        const { month, year, title, isDone } = req.body
        const student = req.params.id
        const level = await StudentGoals.findOne({ student })
        if (!level) {
            const newLevel = new StudentGoals({
                student,
                goals: [
                    {
                        month,
                        year,
                        title,
                        isDone,
                    }
                ]
            })
            await newLevel.save()
            return res.status(200).json({ message: "Goals Assigned" })
        } else {
            // check if month and year already exists
            const checkMonth = level.goals.filter(data => data.month === month && data.year === year)
            if (checkMonth.length > 0) {
                // update the month and year data
                let goal = checkMonth[0].goal.find(item => item.title === title)
                if (goal) {
                    goal.title = title || goal.title;
                    goal.isDone = isDone || goal.isDone;
                } else {
                    checkMonth[0].goal.push({
                        title,
                        isDone,
                    })
                }
                await StudentGoals.updateOne({
                    student
                }, {
                    goals: level.goals
                })
                return res.status(201).json({ message: "Goals Updated" })
            } else {
                level.goals.push({
                    month,
                    year,
                    goal:[
                        {
                            title,
                            isDone
                        }
                    ]
                })
                await level.save()
                return res.status(200).json({ message: "Goals Assigned" })
            }
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

exports.getGoals = async (req, res) => {
    try {
        const student = req.params.id
        const level = await StudentGoals.findOne({ student });
        if (!level) {
            return res.status(404).json({ message: "Student Not found" })
        } else {
            return res.status(200).json(level)
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
};


exports.deleteGoal = async (req, res) => {
    try {
        const student = req.params.id
        const index = req.body.goal;
        const level = await StudentGoals.findOneAndUpdate({ student }, {
            $pull: {
                goals: {
                    _id: index
                }
            }
        })
        if (!level) {
            return res.status(404).json({ message: "Student Not found" })
        } else {
            return res.status(200).json({ message: "Goal Deleted" })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
};

exports.updateGoal = async (req, res) => {
    try {
        const student = req.params.id
        const index = req.body.goal;
        const level = await StudentGoals.findOne({ student })
        if (!level) {
            return res.status(404).json({ message: "Student Not found" })
        } else {
            level.goals.id(index).isDone = !level.goals.id(index).isDone;
            await level.save()
            return res.status(200).json({ message: "Goal Updated" })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}