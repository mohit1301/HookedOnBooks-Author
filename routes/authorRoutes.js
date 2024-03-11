const express = require('express')
const router = express.Router()
const Author = require('../models/authorModel')
const axios = require('axios')

//Get All Authors 
router.get('/getAllAuthors', async (req, res) => {
  try {
    const authors = await Author.find()
    res.send(authors)
  } catch (error) {
    res.send('error occurred while fetching the authors')
  }
})

// New Author Route
router.get('/new', (req, res) => {
  res.render('authors/new', { author: new Author(), authorBaseUrl: `${process.env.AUTHOR_BASEURL}` })
})

//Get author details by Book Id
router.get('/getById', async (req, res) => {
  try {
    const author = await Author.findById(req.query.id)
    res.send(author)
  } catch (error) {
    res.send('An error occurred')
  }
})


// Get an Author by Id
router.get('/:id', async (req, res) => {
  const errorMessage = req.query.errorMessage ?? null
  const accessToken = req.cookies.accessToken
  try {
    const author = await Author.findById(req.params.id)
    const books = await axios.get(`${process.env.BOOKS_BASEURL}/books/getByAuthorId?id=${author.id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    res.render('authors/show', {
      author: author,
      booksByAuthor: books,
      authorBaseUrl: `${process.env.AUTHOR_BASEURL}`,
      booksBaseUrl: `${process.env.BOOKS_BASEURL}`,
      errorMessage
    })
  } catch (error) {
    console.log(error)
    res.redirect('/authors')
  }
})

router.get('/:id/edit', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id)
    res.render('authors/edit', { author: author, authorBaseUrl: `${process.env.AUTHOR_BASEURL}` })
  } catch {
    res.redirect('/authors')
  }
})

// All Authors Route with search options
router.get('/', async (req, res) => {
  let searchOptions = {}
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
  try {
    const authors = await Author.find(searchOptions)
    res.render('authors/index', {
      authors: authors,
      searchOptions: req.query,
      authorBaseUrl: `${process.env.AUTHOR_BASEURL}`
    })
  } catch {
    res.redirect('/authors')
  }
})

// Create Author Route
router.post('/', async (req, res) => {
  const author = new Author({
    name: req.body.name
  })
  try {
    await author.save()
    res.redirect(`/authors`)
  } catch {
    res.render('authors/new', {
      author: author,
      errorMessage: 'Error creating an Author',
      authorBaseUrl: `${process.env.AUTHOR_BASEURL}`
    })
  }
})

router.put('/:id', async (req, res) => {
  let author
  try {
    author = await Author.findById(req.params.id)
    author.name = req.body.name
    await author.save()
    res.redirect(`/authors/${author.id}`)
  } catch {
    if (author == null) {
      res.redirect('/authors')
    } else {
      res.render('authors/edit', {
        author: author,
        errorMessage: 'Error updating Author',
        authorBaseUrl: `${process.env.AUTHOR_BASEURL}`
      })
    }
  }
})

router.delete('/:id', async (req, res) => {
  const accessToken = req.cookies.accessToken
  try {
    const author = await Author.findById(req.params.id)
    if (!author) {
      return res.redirect('/authors')
    }

    // Check if there are any books associated with the author
    const books = await axios.get(`${process.env.BOOKS_BASEURL}/books/getByAuthorId?id=${author.id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    if (books.data && books.data.length > 0) {
      const errorMessage = 'Cannot delete author. There are books associated with this author.'
      return res.redirect(`/authors/${author.id}?errorMessage=${errorMessage}`)
    }

    // No books associated, proceed with author deletion
    await author.deleteOne();

    // Redirect to the authors page
    return res.redirect('/authors')
  } catch (error) {
    console.log('an error occurred', error)
    // If any error occurs, redirect with an error message
    return res.redirect(`/authors/${req.params.id}?errorMessage=${error.message}`)
  }
})


module.exports = router