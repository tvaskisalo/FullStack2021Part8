require('dotenv').config()
const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server')

const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const MONGODB = process.env.MONGODB_URI
const JWT_SECRET = process.env.JWT_SECRET

mongoose.connect(MONGODB)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })


//let authors = [
//  {
//    name: 'Robert Martin',
//    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",Number
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
    me: User
  }
  type Author {
    name: String!
    bookCount: Int
    id: ID!
    born: Int
  }
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  type Token {
    value: String!
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
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }

`

const resolvers = {
  Query: {
      authorCount: () => Author.collection.countDocuments(),
      bookCount: () => Book.collection.countDocuments(),
      allBooks: async(root,args) => {
          if (args.author && args.genre) {
            const copy = books.filter(b => b.author === args.author)
            return copy.filter(b => b.genres.includes(args.genre))
          } else if (args.author) {
            return books.filter(b => b.author === args.author)
          } else if (args.genre) {
            return await Book.find({genres: {$in: [args.genre]}}).populate('author')
          } else {
            return await Book.find({}).populate('author')
          }
      },
      allAuthors: async(root, args) => {
        return await Author.find({})
      },
      me: (root, args, context) => context.currentUser
  },
  Author: {
    bookCount: async (root) => {
      const books = await Book.find({author: root})
      return books.length
    }
  },
  Mutation: {
      addBook: async (root,args,context) => {
        const currentUser = context.currentUser
        if(!currentUser) {
          throw new AuthenticationError("not authenticated")
        }
        let author = await Author.findOne({name: args.author})
        if (author) {
          const book = new Book({...args, author:author})
          try {
            await book.save()
          } catch (error) {
            throw new UserInputError(error.message, {
              invalidArgs: [args.title, args.published],
            })
          }
          return book
        }
        author = new Author({name: args.author, born: null})
        try {
          author = await author.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args.author,
          })
        }
        const book = new Book({...args, author:author})
        try {
          await book.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: [args.title, args.published],
          })
        }
        return book
      },
      editAuthor: async (root,args, context) => {
        const currentUser = context.currentUser
        if(!currentUser) {
          throw new AuthenticationError("not authenticated")
        }
        try {
          const author = await Author.findOneAndUpdate({name: args.name}, {born: args.setBornTo})
          return {name: author.name, born: args.setBornTo}
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: {...args},
          })
        }
      },
      createUser: async (root,args) => {
        console.log({...args})
        const user = new User({...args})
        try {
          await user.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: {...args},
          })
        }
        return user
      },
      login: async(root, args) => {
        const user = await User.findOne({username: args.username})

        if (!user || args.password !=='GraphQL') {
          throw new UserInputError("wrong login credentials")
        }

        const userForToken = {
          username: user.username,
          id: user._id
        }

        return {value: jwt.sign(userForToken, JWT_SECRET)}
      }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})