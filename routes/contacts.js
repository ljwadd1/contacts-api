import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/'); // save uploaded files in `public/images` folder
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop();// get file extension
    const uniqueFilename = Date.now() + '-' + Math.round(Math.random() * 1000) + '.' + ext; // generate unique filename - current timestamp + random number between 0 and 1000.
    cb(null, uniqueFilename);
  }
});
const upload = multer({ storage: storage});

// Prisma setup
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Get all contacts
router.get('/all', async (req, res) => { 
  const contacts = await prisma.contact.findMany();

  res.json(contacts);
});

// Get a contact by id
router.get('/get/:id', async (req, res) => {
  const id = req.params.id;

  // Validate id
  if(isNaN(id)){
    res.status(400).send('Invalid contact id.');
    return;
  }

  const contact = await prisma.contact.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if(contact){
    res.json(contact);
  } else {
    res.status(404).send('Contact not found.');
  }  
});

// Add a new contact
router.post('/create', upload.single('image'), async (req, res) => {
  const { firstName, lastName, phone, email, title } = req.body;  
  const filename = req.file ? req.file.filename : null;
  
  // Validate inputs
  if(!firstName || !lastName || !phone || !email) {
    //to-do: delete uploaded file

    res.status(400).send('Required fields must have a value.');
    return;
  }

  // to-do: Validate proper email, proper phone number, only .jpg/.png/.gig/, file size limit (5MB)

  const contact = await prisma.contact.create({
    data: {
      firstName: firstName,
      lastName: lastName,
      title: title,
      phone: phone,
      email: email,
      filename: filename,
    }
  });

  res.json(contact);
});

// Update a contact by id
router.put('/update/:id', upload.single('image'), (req, res) => {
  const id = req.params.id;

  // Capture inputs

  // Validate id

  // Validate required fields

  // Find contact by id (if not found, return 404)

  // Store filename in a variable

  // If file was uploaded: save the filename and delete old file, else: save the old filename

  // Update record in database with prisma (saving either old or new filename)

  res.send('Update a contact by ' + id);
});

// Delete a contact id
router.delete('/delete/:id', (req, res) => {
  const id = req.params.id;

  // to-do: verify :id is a number

  // find the contact by id (if not found, return 404)

  // delete the record with prisma

  // Delete the file (if contact has one)

  res.send('Delete a contact by id ' + id);
});


export default router;
