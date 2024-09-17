import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Contacts route');
});

// GET: All contacts
router.get('/all', (req, res) => {
    res.send('All contacts');
  });
  
  // GET: Contact by id
  router.get('/:id', (req, res) => {
    const id = req.params.id;
    res.send('Contact by id ' + id);
  });
  
  // POST: Create contact
  router.post('/create', (req, res) => {
    res.send('Create contact');
  });

  // PUT: Update contact
  router.put('/update', (req, res) => {
    res.send('Update contact');
  });

  // DELETE: Delete contact
  router.delete('/delete', (req, res) => {
    res.send('Delete contact');
  });
  

export default router;
