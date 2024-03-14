const StudentHomework = require("../models/StudentHomework")

exports.assignHomework = async (req, res) => {
    try {
        const { month, year, title, link, dueDate, isDone, percentage } = req.body
        const student = req.params.id
        const level = await StudentHomework.findOne({ student })
        if (!level) {

            const newLevel = new StudentHomework({
                student,
                homeworks: [
                    {
                        month,
                        year,
                        homework: [
                            {
                                title,
                                link,
                                dueDate,
                                isDone,
                                percentage
                            }
                        ]
                    }
                ]
            })
            await newLevel.save()
            return res.status(200).json({ message: "Homework Assigned" })
        } else {
            // check if month and year already exists
            const checkMonth = level.homeworks.filter(data => data.month === month && data.year === year)
            if (checkMonth.length > 0) {
                // update the month and year data
                let homework = checkMonth[0].homework.find(item => item.link === link && item.title === title)
                if (homework) {
                    homework.title = title || homework.title;
                    homework.link = link || homework.link;
                    homework.dueDate = dueDate || homework.dueDate;
                    homework.isDone = isDone || homework.isDone;
                    homework.percentage = percentage || homework.percentage;
                }
                else {
                    checkMonth[0].homework.push({
                        title,
                        link,
                        dueDate,
                        isDone,
                        percentage
                    })
                }
                await StudentHomework.updateOne({
                    student
                }, {
                    homeworks: level.homeworks
                })
                return res.status(201).json({ message: "Homework Updated" })
            } else {
                level.homeworks.push({
                    month,
                    year,
                    homework: [{
                        title,
                        link,
                        dueDate,
                        isDone,
                        percentage
                    }]

                })
                await level.save()
                return res.status(200).json({ message: "Homework Assigned" })
            }
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

exports.getHomeworks = async (req, res) => {
    try {
        const student = req.params.id
        const level = await StudentHomework.findOne({ student })
        if (!level) {
            return res.status(404).json({ message: "Student Not found" })
        } else {
            return res.status(200).json(level)
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

//marks a homework as done or not done
exports.markHomework = async (req, res) => {
    try {
        let { hwId } = req.body
        const student = req.params.id
        const level = await StudentHomework.findOne({ student })

        if (!level) {
            return res.status(404).json({ message: "Homework Not found" })
        } else {
            // check if homework already exists
            const checkHomework = level.homeworks.filter(data => data._id == hwId)
            if (checkHomework.length > 0) {
                // update the homework data
                checkHomework[0].isDone = !checkHomework[0].isDone;
                await StudentHomework.updateOne({ student }, { homeworks: level.homeworks })
            } else {
                return res.status(404).json({ message: "Homework Not found" })
            }
            return res.status(200).json({ message: "Homework Marked" })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}