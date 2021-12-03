require('dotenv').config()
const { ApolloServer, gql } = require('apollo-server')

const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const MONGODB = process.env.MONGODB_URI

const { v1: uuid } = require('uuid')

mongoose.connect(MONGODB)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

let authors =[]
let books = []
useEffect(async () => {
  authors = await Author.find({})
  books = await Book.find({})
},[])

//let authors = [
//  {
//    name: 'Robert Martin',
//    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
//    born: 1952,
//  },
//  {
//    name: 'Martin Fowler',
//    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
//    born: 1963
//  },
//  {
//    name: 'Fyodor Dostoevsky',
//    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
//    born: 1821
//  },
//  { 
//    name: 'Joshua Kerievsky', // birthyear not known
//    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
//  },
//  { 
//    name: 'Sandi Metz', // birthyear not known
//    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
//  },
//]
//
///*
// * Suomi:
// * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
// * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
// *
// * English:
// * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
// * However, for simplicity, we will store the author's name in connection with the book
//*/
//
//let books = [
//  {
//    title: 'Clean Code',
//    published: 2008,
//    author: 'Robert Martin',
//    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
//    genres: ['refactoring']
//  },
//  {
//    title: 'Agile software development',
//    published: 2002,
//    author: 'Robert Martin',
//    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
//    genres: ['agile', 'patterns', 'design']
//  },
//  {
//    title: 'Refactoring, edition 2',
//    published: 2018,
//    author: 'Martin Fowler',
//    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
//    genres: ['refactoring']
//  },
//  {
//    title: 'Refactoring to patterns',
//    published: 2008,
//    author: 'Joshua Kerievsky',
//    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
//    genres: ['refactoring', 'patterns']
//  },  
//  {
//    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
//    published: 2012,
//    author: 'Sandi Metz',
//    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
//    genres: ['refactoring', 'design']
//  },
//  {
//    title: 'Crime and punishment',
//    published: 1866,
//    author: 'Fyodor Dostoevsky',
//    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
//    genres: ['classic', 'crime']
//  },
//  {
//    title: 'The Demon ',
//    published: 1872,
//    author: 'Fyodor Dostoevsky',
//    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
//    genres: ['classic', 'revolution']
//  },
//]

const typeDefs = gql`
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author]
  }
  type Author {
    name: String!
    bookCount: Int
    id: ID!
    born: Int
  }
  type Book {
    title: String!
    id: ID!
    published: Int!
    genres: [String]
    author: Author!
  }
  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String]
    ): Book
    editAuthor(
        name: String!
        setBornTo: Int!
    ): Author
  }

`

const resolvers = {
  Query: {
      authorCount: () => authors.length,
      bookCount: () => books.length,
      allBooks: (root,args) => {
          if (args.author && args.genre) {
            const copy = books.filter(b => b.author === args.author)
            return copy.filter(b => b.genres.includes(args.genre))
          } else if (args.author) {
              return books.filter(b => b.author === args.author)
          } else if (args.genre) {
              return books.filter(b => b.genres.includes(args.genre))
          } else {
              return books
          }
      },
      allAuthors: () => authors
  },
  Author: {
    bookCount: (root) => books.filter(b => b.author === root.name).length
  },
  Mutation: {
      addBook: async (root,args) => {
        let author =Author.findOne({name: args.author})
          if (author.length===1) {
            const book = new Book({...args, author:author})
            return book.save()
          }
        author = new Author({name: args.name, born: null})
        author = await author.save()
        const book = new Book({...args, author:Author})
        return book.save()
      },
      editAuthor: (root,args) => {
          const author = authors.find(a => a.name === args.name)
          if (!author) {
              return null
          } else {
              authors= authors.map(a => a.name!==args.name ? a : {name: a.name, id:a.id, born: args.setBornTo})
              return {name: args.name, born: args.setBornTo}
          }
      }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})