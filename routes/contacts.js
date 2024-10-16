import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';  // file system module to delete uploaded images

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
router.post('/create', upload.single('filename'), async (req, res) => {
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
router.put('/update/:id', upload.single('filename'), async (req, res) => {

  // Capture inputs
  const id = req.params.id;
  const { firstName, lastName, phone, email, title } = req.body;
  const newFilename = req.file ? req.file.filename : null;

  // Validate id
  if(isNaN(id)){
    return res.status(400).json({ message: 'Invalid contact id.' });
  }

  // Validate required fields
  if(!firstName || !lastName || !phone || !email) {
    return res.status(400).json({ message: 'Required fields must have a value.' });
  }

  // TODO: Add additional validations (optional)

  // Find contact by id (if not found, return 404)
  const contact = await prisma.contact.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if(contact === null){
    return res.status(404).json({ message: 'Contact not found.' });
  }

  // If file was uploaded: save the filename and delete old file, else: save the old filename
  if(newFilename && contact.filename){
    fs.unlink('public/images/' + contact.filename, (err) => {
      if (err) {
        console.error(err)
        return res.status(500).json({ message: 'Error deleting old file.' });
      }
    });
  }

  // Update record in database with prisma (saving either old or new filename)
  const updatedContact = await prisma.contact.update({
    where: {
      id: parseInt(id),
    },
    data: {
      firstName: firstName,
      lastName: lastName,
      title: title,
      phone: phone,
      email: email,
      filename: newFilename || contact.filename,
    },
  });

  res.json(updatedContact);
});


// Delete a contact id
router.delete('/delete/:id', async (req, res) => {
  const id = req.params.id;

  // to-do: verify :id is a number
  if(isNaN(id)){
    res.status(400).json({ message: 'Invalid contact id.' });
    return;
  }

  // find the contact by id (if not found, return 404)
  const contact = await prisma.contact.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if(contact === null){
    res.status(404).json({ message: 'Contact not found.' });
    return;
  }

  // Delete the file (if contact has one)
  if(contact.filename){
    fs.unlink('public/images/' + contact.filename, (err) => {
      if (err) {
        console.error(err)
        return res.status(500).json({ message: 'Error deleting file.' });
      }
    });
  }

  // delete the record with prisma
  const deletedContact = await prisma.contact.delete({
    where: {
      id: parseInt(id),
    },
  });


  res.send({ message: 'Delete a contact by id ' + id });
});


export default router;
