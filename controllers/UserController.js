
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const Student = require('../models/Student');


// Set up multer storage for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/profiles');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });




// Register a new student
exports.registerStudent = async (req, res) => {
    try {
        // Check if student already exists and rollNo already exist
        const existingRollNo = await Student.findOne({ rollNo: req.body.rollNo });
        if (existingRollNo) {
            return res.status(400).json({ message: 'Roll No already exists' });
        }
        const existingStudent = await Student.findOne({ email: req.body.email });
        if (existingStudent) {
            return res.status(400).json({ message: 'Student already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        
        // Create new student object
        const newStudent = new Student({
            rollNo: req.body.rollNo,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword,
            profileImage: req.file ? req.file?.filename : ""
        });

        // Save student to database
        const savedStudent = await newStudent.save();

        // Generate JWT token
 
        const token = jwt.sign({ id: savedStudent._id }, process.env.JWT_SECRET);

        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login a student
exports.loginStudent = async (req, res) => {
    try {
        // Check if student exists
        const student = await Student.findOne({ email: req.body.email });
        if (!student) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if password is correct
        const validPassword = await bcrypt.compare(req.body.password, student.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET);

        res.status(200).json({ "token":token,"userType":req.body.userType });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get student details
exports.getStudentDetails = async (req, res) => {
    try {
        // Find student by id
        const student = await Student.find().select('-password -dateCreated -dateUpdated');
        res.status(200).json(student);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}
//get student by ID
exports.getStudentById = async (req, res) => {
    try {
        // Find student by id
        const student = await Student.findOne({email:req.params.email}).select('-password -dateCreated -dateUpdated');
        res.status(200).json(student);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}
// Update student details
exports.updateStudentDetails = async (req, res) => {
    try {
        // Validation
        if (req.body.rollNo) {
            return res.status(400).json({ message: 'Roll No cannot be updated' });
        }
        if (req.body.email) {
            return res.status(400).json({ message: 'Email cannot be updated' });
        }
        if (req.body.password) {
            return res.status(400).json({ message: 'Password cannot be updated' });
        }
        // Find and update the student
        let student = await Student.findByIdAndUpdate(req.student.id, req.body, { new: true })
        res.status(200).json(student);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}
// Delete a student
exports.deleteStudent = async (req, res) => {
    try {
        // Find and delete the student
        await Student.findOneAndDelete({email:req.params.email});
        res.status(200).json({ message: 'Student deleted' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}
// create a function that takes token and return the student
exports.getCurrentUser = async (req,res) =>{
    
    const token = req.query.token
   
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
       
        const student = await Student.findById(decoded.id).select('-password -dateCreated -dateUpdated');
        
        res.status(200).json(student);
    }
    catch(error){
        console.log(error)
        res.status(400).json({ message: 'Invalid credentials' });
    }


}

// Handle image upload
exports.uploadImage = upload.single('profileImage');
