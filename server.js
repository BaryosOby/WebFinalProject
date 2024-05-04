const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");
const path = require("path");

const app = express();
const port = 3000;
const uri = "mongodb://localhost:27017";
const dbName = "myDatabase";

// Create a new MongoClient
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the "Client" folder
app.use(express.static(path.join(__dirname, "Client")));

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "Client", "LoginUser.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "Client", "RegisterUser.html"));
});

// Connect to the MongoDB server
async function connectToMongoDB() {
  try {
    // Connect to the server
    await client.connect();
    console.log("Connected to MongoDB server");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

// Handle user registration
app.post("/register", async (req, res) => {
  const { firstName, email, password } = req.body;

  try {
    // Access the database
    const db = client.db(dbName);

    // Check if the email is already registered
    const user = await db.collection("users").findOne({ email });
    if (user) {
      return res.status(400).json({
        message:
          "The email address is already registered. Please use a different email.",
      });
    }

    // Insert the new user document
    await db
      .collection("users")
      .insertOne({ firstName, email, password, todos: [] });

    // Respond with success
    res.sendStatus(200);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      message: "An error occurred while registering. Please try again later.",
    });
  }
});

// Handle user login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Access the database
    const db = client.db(dbName);

    // Check if the email and password match a user in the database
    const user = await db.collection("users").findOne({ email, password });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Respond with success and include the user's email in the response
    res.status(200).json({ email }); // Separate the status and JSON response
  } catch (error) {
    console.error("Server logger - Error logging in user:", error);
    res.status(500).json({
      message: "An error occurred while logging in. Please try again later.",
    });
  }
});

// Handle fetching user information by email
app.get("/getUserInfo", async (req, res) => {
  const { email } = req.query;
  console.log("Fetching user info for email:", email); // Log the email being fetched

  try {
    // Access the database
    const db = client.db(dbName);

    // Query the database to find the user by email
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Respond with user information
    res
      .status(200)
      .json({ name: user.firstName, email: user.email, todos: user.todos });
  } catch (error) {
    console.error("Error fetching user information:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching user information." });
  }
});

// Handle saving todo item
app.post("/todos", async (req, res) => {
  const { email, todo } = req.body;

  try {
    // Access the database
    const db = client.db(dbName);

    // Update user document with new todo item
    const newTodoId = new ObjectId().toString();
    await db
      .collection("users")
      .updateOne(
        { email },
        { $push: { todos: { id: newTodoId, text: todo } } }
      );

    // Respond with success
    res.status(200).json({ id: newTodoId });
  } catch (error) {
    console.error("Error saving todo item:", error);
    res
      .status(500)
      .json({ message: "An error occurred while saving todo item." });
  }
});

// Handle loading user's todos
app.get("/todos", async (req, res) => {
  const { email } = req.query;
  console.log("Fetching user info for email:", email); // Log the email being fetched

  try {
    // Access the database
    const db = client.db(dbName);

    // Find user document by email and return todos
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (req.headers.accept === "application/json") {
      res.status(200).json({ todos: user.todos });
    } else {
      // Serve the HTML file if the client does not accept JSON
      const p = path.join(__dirname, "Client", "todos.html");
      console.log(p, "here");
      res.sendFile(p);
    }
  } catch (error) {
    console.error("Error loading todos:", error);
    res.status(500).json({ message: "An error occurred while loading todos." });
  }
});

app.delete("/todos/:text", async (req, res) => {
  const { email } = req.query;
  const { text: todoId } = req.params;

  try {
    // Access the database
    const db = client.db(dbName);

    // Get the user document
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Filter the todos array to exclude the item with the given todoId
    const updatedTodos = user.todos.filter(
      (todo) => todo.id?.toString() !== todoId?.toString()
    );

    // Update the user document with the updated todos array
    await db
      .collection("users")
      .updateOne({ email }, { $set: { todos: updatedTodos } });

    // Respond with success
    res.sendStatus(200);
  } catch (error) {
    console.error("Error deleting todo item:", error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting todo item." });
  }
});

// Handle user logout
app.post("/logout", async (req, res) => {
  const { email } = req.body;

  // Perform logout operations if needed

  // Respond with success
  res.sendStatus(200);
});

// Start the server
app.listen(port, async () => {
  await connectToMongoDB();
  console.log(`Server is running on port ${port}`);
});

// Close the MongoDB client connection when the server shuts down
process.on("SIGINT", async () => {
  await client.close();
  console.log("MongoDB connection closed");
  process.exit();
});
