export interface RoadmapNode {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  prerequisites: string[];
  skills: string[];
  resources: { title: string; url: string; type: 'video' | 'article' | 'doc' }[];
  quizzes: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface PathData {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  tags: string[];
  nodes: RoadmapNode[];
  connections: { from: string; to: string; type: 'solid' | 'dashed' }[];
}

export const PATHS: Record<string, PathData> = {
  'data-analysis': {
    id: 'data-analysis',
    title: 'Data Analysis',
    description: 'The foundational layer. Master data exploration, statistical thinking, and compelling visualization to drive business decisions.',
    icon: 'query_stats',
    color: 'primary',
    tags: ['EDA', 'Visualization', 'BI Tools'],
    connections: [
      { from: 'foundations', to: 'eda', type: 'solid' },
      { from: 'eda', to: 'visualization', type: 'solid' },
      { from: 'visualization', to: 'bi-tools', type: 'solid' }
    ],
    nodes: [
      {
        id: 'foundations',
        title: 'Foundations',
        subtitle: 'SQL & Python Basics',
        description: 'Learn the fundamentals of querying databases and writing basic data manipulation scripts using Python.',
        icon: 'database',
        prerequisites: [],
        skills: ['SQL Select', 'Joins', 'Python Data Types', 'Pandas Intro'],
        resources: [
          { title: 'Kaggle SQL Summer Camp', url: 'https://www.kaggle.com/learn/intro-to-sql', type: 'article' },
          { title: 'Pandas Getting Started Guide', url: 'https://pandas.pydata.org/docs/getting_started/index.html', type: 'doc' }
        ],
        quizzes: [
          {
            question: 'Which SQL clause is used to filter the results of a query after aggregation?',
            options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'],
            correctIndex: 1,
            explanation: 'The HAVING clause is used to filter query results after the GROUP BY clause has aggregated the rows. WHERE filters rows before aggregation.'
          }
        ]
      },
      {
        id: 'eda',
        title: 'Exploratory Data Analysis',
        subtitle: 'EDA & Statistics',
        description: 'Understand how to summarize the main characteristics of datasets, often with visual methods, and apply statistical tests.',
        icon: 'analytics',
        prerequisites: ['foundations'],
        skills: ['Descriptive Stats', 'Data Cleaning', 'Outlier Detection', 'Correlation'],
        resources: [
          { title: 'Introduction to EDA with Python', url: 'https://towardsdatascience.com/exploratory-data-analysis-haberman-dataset-d4da465530cf', type: 'article' }
        ],
        quizzes: [
          {
            question: 'What does a high positive correlation (close to +1) between two variables indicate?',
            options: ['As one increases, the other decreases', 'As one increases, the other also increases', 'There is no linear relationship', 'One variable causes the other'],
            correctIndex: 1,
            explanation: 'A correlation close to +1 indicates a strong positive linear relationship: as one variable increases, the other tends to increase as well. Correlation does not imply causation.'
          }
        ]
      },
      {
        id: 'visualization',
        title: 'Data Visualization',
        subtitle: 'Matplotlib, Seaborn',
        description: 'Learn the principles of effective data communication through charts, graphs, and maps.',
        icon: 'bar_chart',
        prerequisites: ['eda'],
        skills: ['Line/Bar Charts', 'Scatter Plots', 'Heatmaps', 'Design Principles'],
        resources: [
          { title: 'Storytelling with Data', url: 'https://www.storytellingwithdata.com/', type: 'article' }
        ],
        quizzes: [
          {
            question: 'Which type of chart is best suited for showing the distribution of a single continuous variable?',
            options: ['Bar Chart', 'Pie Chart', 'Scatter Plot', 'Histogram'],
            correctIndex: 3,
            explanation: 'A histogram is ideal for showing the distribution of a continuous variable by grouping values into bins.'
          }
        ]
      },
      {
        id: 'bi-tools',
        title: 'BI Tools',
        subtitle: 'Tableau & PowerBI',
        description: 'Build interactive dashboards that business stakeholders can use to monitor KPIs and explore data.',
        icon: 'dashboard',
        prerequisites: ['visualization'],
        skills: ['Dashboard Design', 'Calculated Fields', 'Data Modeling', 'Row Level Security'],
        resources: [
          { title: 'Tableau Training Videos', url: 'https://www.tableau.com/learn/training/20204', type: 'video' }
        ],
        quizzes: [
          {
            question: 'What is the primary purpose of a Dimension in business intelligence tools?',
            options: ['To aggregate numerical values', 'To categorize or segment data (e.g., Date, Region)', 'To calculate ratios', 'To store metadata only'],
            correctIndex: 1,
            explanation: 'Dimensions contain qualitative values (such as names, dates, or geographical data). You can use dimensions to categorize, segment, and reveal the details in your data.'
          }
        ]
      }
    ]
  },
  'data-engineering': {
    id: 'data-engineering',
    title: 'Data Engineering',
    description: 'Build the infrastructure. Design robust pipelines, manage massive datasets, and ensure data quality and accessibility.',
    icon: 'account_tree',
    color: 'secondary',
    tags: ['ETL', 'dbt', 'Airflow', 'Cloud'],
    connections: [
      { from: 'foundations', to: 'etl', type: 'solid' },
      { from: 'foundations', to: 'modeling', type: 'dashed' },
      { from: 'etl', to: 'dbt', type: 'dashed' },
      { from: 'etl', to: 'orchestration', type: 'solid' },
      { from: 'orchestration', to: 'spark', type: 'solid' }
    ],
    nodes: [
      {
        id: 'foundations',
        title: 'Foundations',
        subtitle: 'SQL & Python Basics',
        description: 'Learn the fundamentals of querying databases and writing basic data manipulation scripts using Python.',
        icon: 'database',
        prerequisites: [],
        skills: ['SQL Select', 'Joins', 'Python Data Types', 'Pandas Intro'],
        resources: [
          { title: 'Kaggle SQL Summer Camp', url: 'https://www.kaggle.com/learn/intro-to-sql', type: 'article' },
          { title: 'Pandas Getting Started Guide', url: 'https://pandas.pydata.org/docs/getting_started/index.html', type: 'doc' }
        ],
        quizzes: [
          {
            question: 'Which SQL join returns all rows from the left table, and the matched rows from the right table?',
            options: ['INNER JOIN', 'RIGHT JOIN', 'LEFT JOIN', 'FULL OUTER JOIN'],
            correctIndex: 2,
            explanation: 'A LEFT JOIN returns all records from the left table, and the matched records from the right table. If there is no match, the result is NULL on the right side.'
          }
        ]
      },
      {
        id: 'etl',
        title: 'ETL Concepts',
        subtitle: 'Extract, Transform, Load',
        description: 'Master the core concepts of moving data from source systems, transforming it for analysis, and loading it into a target warehouse.',
        icon: 'transform',
        prerequisites: ['foundations'],
        skills: ['Batch vs Streaming', 'API Ingestion', 'Data Cleansing', 'Schema Validation'],
        resources: [
          { title: 'Data Engineering Zoomcamp: ETL', url: 'https://github.com/DataTalksClub/data-engineering-zoomcamp', type: 'doc' }
        ],
        quizzes: [
          {
            question: 'What is the key difference between ETL and ELT?',
            options: [
              'ETL is only for streaming data',
              'ELT leverages the computing power of the target data warehouse to perform transformations after loading',
              'ETL does not use a database',
              'ELT is slower than ETL in all cases'
            ],
            correctIndex: 1,
            explanation: 'In ELT (Extract-Load-Transform), raw data is loaded directly into the target system (like BigQuery or Snowflake) first, and transformations are executed inside the warehouse using SQL, leveraging its scalability.'
          }
        ]
      },
      {
        id: 'modeling',
        title: 'Data Modeling',
        subtitle: 'Dimensional Modeling',
        description: 'Design database schemas optimized for analytical queries. Learn star schemas, snowflake schemas, and normalization.',
        icon: 'schema',
        prerequisites: ['foundations'],
        skills: ['Star Schema', 'Fact Tables', 'Dimension Tables', 'SCD Type 2'],
        resources: [
          { title: 'The Data Warehouse Toolkit (Kimball)', url: 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/', type: 'doc' }
        ],
        quizzes: [
          {
            question: 'What is a Slowly Changing Dimension (SCD) Type 2?',
            options: [
              'Overwriting the old value in the dimension table',
              'Creating a new row with a surrogate key and active date range to preserve historical state',
              'Adding a new column to store the previous value',
              'Ignoring changes to dimension attributes'
            ],
            correctIndex: 1,
            explanation: 'SCD Type 2 tracks historical data by creating a new record in the dimension table when an attribute changes, using effective date ranges and active flags to identify the current record.'
          }
        ]
      },
      {
        id: 'dbt',
        title: 'dbt Framework',
        subtitle: 'Data Build Tool',
        description: 'Transform data in your warehouse using SQL select statements. Manage version control, testing, and documentation.',
        icon: 'code_blocks',
        prerequisites: ['etl'],
        skills: ['dbt Models', 'Jinja Templating', 'Data Testing', 'dbt Docs'],
        resources: [
          { title: 'dbt Fundamentals Course', url: 'https://courses.getdbt.com/courses/fundamentals', type: 'video' }
        ],
        quizzes: [
          {
            question: 'In dbt, what does the ref() function do?',
            options: [
              'Refers to an external API',
              'Creates a dependency link between models, allowing dbt to build them in the correct order',
              'Refreshes the database connection',
              'Runs a unit test on a column'
            ],
            correctIndex: 1,
            explanation: 'The ref() function is the most important function in dbt. It interpolates the correct database relation name and tells dbt about dependencies so it can compile the DAG and run models in order.'
          }
        ]
      },
      {
        id: 'orchestration',
        title: 'Orchestration',
        subtitle: 'Apache Airflow',
        description: 'Schedule and monitor complex workflows. Define Directed Acyclic Graphs (DAGs) in Python.',
        icon: 'settings_input_component',
        prerequisites: ['etl'],
        skills: ['DAG Definition', 'Airflow Operators', 'XComs', 'Task Scheduling'],
        resources: [
          { title: 'Astronomer Airflow Tutorials', url: 'https://academy.astronomer.io/', type: 'video' }
        ],
        quizzes: [
          {
            question: 'How do you define a task dependency in Apache Airflow?',
            options: [
              'Using the bitshift operators >> and <<',
              'By naming the tasks alphabetically',
              'Using the set_dependency() function',
              'In the airflow.cfg configuration file'
            ],
            correctIndex: 0,
            explanation: 'In Airflow, task dependencies are defined using bitshift operators, e.g., task1 >> task2 (task1 runs before task2), or using .set_downstream() / .set_upstream().'
          }
        ]
      },
      {
        id: 'spark',
        title: 'Distributed Compute',
        subtitle: 'Apache Spark / PySpark',
        description: 'Process massive datasets across a cluster. Learn Spark RDDs, DataFrames, and optimization techniques.',
        icon: 'electric_bolt',
        prerequisites: ['orchestration'],
        skills: ['Spark Architecture', 'PySpark DataFrames', 'Shuffling & Partitioning', 'Caching'],
        resources: [
          { title: 'Spark Programming Guide', url: 'https://spark.apache.org/docs/latest/sql-programming-guide.html', type: 'doc' }
        ],
        quizzes: [
          {
            question: 'What is a "shuffle" in Apache Spark?',
            options: [
              'Randomly re-ordering rows in a partition',
              'Redistributing data across the cluster, which is an expensive network operation',
              'Deleting temporary files',
              'A mechanism to read files in parallel'
            ],
            correctIndex: 1,
            explanation: 'A shuffle is the process of redistributing data across executors or partitions. It occurs during wide transformations like groupBy or join and is highly resource-intensive due to network and disk I/O.'
          }
        ]
      }
    ]
  },
  'data-science': {
    id: 'data-science',
    title: 'Data Science',
    description: 'Predict the future. Apply advanced machine learning algorithms and rigorous experimentation to solve complex problems.',
    icon: 'model_training',
    color: 'tertiary',
    tags: ['ML', 'Experimentation', 'Deployment'],
    connections: [
      { from: 'foundations', to: 'ml-basics', type: 'solid' },
      { from: 'ml-basics', to: 'experimentation', type: 'solid' },
      { from: 'experimentation', to: 'deployment', type: 'solid' }
    ],
    nodes: [
      {
        id: 'foundations',
        title: 'Foundations',
        subtitle: 'SQL & Python Basics',
        description: 'Learn the fundamentals of querying databases and writing basic data manipulation scripts using Python.',
        icon: 'database',
        prerequisites: [],
        skills: ['SQL Select', 'Python Data Types', 'Pandas Intro', 'NumPy'],
        resources: [
          { title: 'Kaggle SQL Course', url: 'https://www.kaggle.com/learn/intro-to-sql', type: 'article' }
        ],
        quizzes: [
          {
            question: 'What does NumPy stand for?',
            options: ['Number Python', 'Numerical Python', 'N-Dimensional Python', 'None of the above'],
            correctIndex: 1,
            explanation: 'NumPy stands for Numerical Python. It is the fundamental package for scientific computing in Python, offering powerful N-dimensional array objects.'
          }
        ]
      },
      {
        id: 'ml-basics',
        title: 'ML Basics',
        subtitle: 'Supervised Learning',
        description: 'Train models to classify items or predict continuous values. Learn linear regression, decision trees, and evaluation metrics.',
        icon: 'psychology',
        prerequisites: ['foundations'],
        skills: ['Regression', 'Classification', 'Train/Test Split', 'Overfitting'],
        resources: [
          { title: 'Scikit-Learn Tutorials', url: 'https://scikit-learn.org/stable/tutorial/index.html', type: 'doc' }
        ],
        quizzes: [
          {
            question: 'What is the main goal of regularization in machine learning?',
            options: ['To speed up training', 'To prevent overfitting by penalizing complex models', 'To increase training accuracy', 'To handle missing values'],
            correctIndex: 1,
            explanation: 'Regularization (e.g., L1/Lasso, L2/Ridge) adds a penalty term to the loss function to discourage large weights, preventing the model from overfitting the training data.'
          }
        ]
      },
      {
        id: 'experimentation',
        title: 'Experimentation',
        subtitle: 'A/B Testing & Stats',
        description: 'Design scientific experiments to validate model improvements and business hypotheses. Learn hypothesis testing.',
        icon: 'biotech',
        prerequisites: ['ml-basics'],
        skills: ['Hypothesis Testing', 'P-values', 'Sample Size Calculation', 'Statistical Power'],
        resources: [
          { title: 'A/B Testing by Google (Udacity)', url: 'https://www.udacity.com/course/ab-testing--ud257', type: 'video' }
        ],
        quizzes: [
          {
            question: 'What is a Type I error in statistical hypothesis testing?',
            options: [
              'Failing to reject a false null hypothesis (False Negative)',
              'Rejecting a true null hypothesis (False Positive)',
              'An error in data collection',
              'Calculating an incorrect p-value'
            ],
            correctIndex: 1,
            explanation: 'A Type I error occurs when we reject the null hypothesis when it is actually true (a false positive finding).'
          }
        ]
      },
      {
        id: 'deployment',
        title: 'Model Deployment',
        subtitle: 'APIs & Inference',
        description: 'Deploy trained models as web services so other applications can consume predictions in real-time.',
        icon: 'publish',
        prerequisites: ['experimentation'],
        skills: ['Flask/FastAPI', 'Dockerizing Models', 'Batch Inference', 'Model Registry'],
        resources: [
          { title: 'Deploying ML Models with FastAPI', url: 'https://testdriven.io/blog/fastapi-machine-learning/', type: 'article' }
        ],
        quizzes: [
          {
            question: 'Which framework is highly recommended for building high-performance, asynchronous Python APIs for ML models?',
            options: ['Django', 'Flask', 'FastAPI', 'Tkinter'],
            correctIndex: 2,
            explanation: 'FastAPI is a modern, fast (high-performance), web framework for building APIs with Python 3.8+ based on standard Python type hints. It is highly suited for serving ML models.'
          }
        ]
      }
    ]
  },
  'ai-llm': {
    id: 'ai-llm',
    title: 'AI & LLM',
    description: 'Harness intelligence. Master prompt engineering, Retrieval-Augmented Generation, and build autonomous AI agents.',
    icon: 'memory',
    color: 'surface-tint',
    tags: ['Prompt Engineering', 'RAG', 'Agents'],
    connections: [
      { from: 'foundations', to: 'prompt-eng', type: 'solid' },
      { from: 'prompt-eng', to: 'rag', type: 'solid' },
      { from: 'rag', to: 'agents', type: 'solid' }
    ],
    nodes: [
      {
        id: 'foundations',
        title: 'Foundations',
        subtitle: 'Python & NLP Basics',
        description: 'Understand the basics of Natural Language Processing, word embeddings, and tokenization.',
        icon: 'text_fields',
        prerequisites: [],
        skills: ['Tokenization', 'Embeddings', 'Transformers Intro', 'Hugging Face'],
        resources: [
          { title: 'Hugging Face NLP Course', url: 'https://huggingface.co/learn/nlp-course', type: 'doc' }
        ],
        quizzes: [
          {
            question: 'What is tokenization in the context of LLMs?',
            options: [
              'Encrypting text for security',
              'Splitting text into smaller units (tokens) like words or subwords',
              'Translating text to another language',
              'Running a model query'
            ],
            correctIndex: 1,
            explanation: 'Tokenization is the process of breaking down raw text into smaller chunks called tokens (words, subwords, or characters) that the model can process.'
          }
        ]
      },
      {
        id: 'prompt-eng',
        title: 'Prompt Engineering',
        subtitle: 'In-Context Learning',
        description: 'Learn techniques to guide LLM outputs. Master Few-Shot prompting, Chain-of-Thought, and system prompt design.',
        icon: 'edit_note',
        prerequisites: ['foundations'],
        skills: ['Zero-Shot / Few-Shot', 'Chain of Thought', 'System Prompts', 'Output Parsing'],
        resources: [
          { title: 'Prompt Engineering Guide', url: 'https://www.promptingguide.ai/', type: 'doc' }
        ],
        quizzes: [
          {
            question: 'What is Chain-of-Thought (CoT) prompting?',
            options: [
              'Linking multiple prompts in a sequence',
              'Encouraging the model to output its step-by-step reasoning before the final answer',
              'Limiting the length of the model output',
              'Running prompts in parallel'
            ],
            correctIndex: 1,
            explanation: 'Chain-of-Thought prompting enables LLMs to decompose complex problems into intermediate steps, which significantly improves reasoning accuracy.'
          }
        ]
      },
      {
        id: 'rag',
        title: 'RAG Systems',
        subtitle: 'Retrieval-Augmented Gen',
        description: 'Connect LLMs to external data sources. Learn vector databases, semantic search, and document chunking.',
        icon: 'find_in_page',
        prerequisites: ['prompt-eng'],
        skills: ['Vector DBs (Pinecone/PGVector)', 'Chunking Strategies', 'Semantic Search', 'Reranking'],
        resources: [
          { title: 'Pinecone Learning Center: RAG', url: 'https://www.pinecone.io/learn/retrieval-augmented-generation/', type: 'article' }
        ],
        quizzes: [
          {
            question: 'Why is document "chunking" necessary in RAG?',
            options: [
              'To encrypt the documents',
              'To fit documents within the LLM context window and capture localized semantic meaning',
              'To translate documents',
              'To delete duplicate files'
            ],
            correctIndex: 1,
            explanation: 'LLMs have a limited context window. Chunking breaks large documents into smaller, coherent passages that can be embedded, indexed, and retrieved based on relevance.'
          }
        ]
      },
      {
        id: 'agents',
        title: 'AI Agents',
        subtitle: 'LangChain & AutoGPT',
        description: 'Build systems where LLMs can plan, use tools, and operate autonomously to accomplish complex goals.',
        icon: 'smart_toy',
        prerequisites: ['rag'],
        skills: ['Tool Use (Function Calling)', 'ReAct Framework', 'Memory Management', 'Agentic Workflows'],
        resources: [
          { title: 'LangChain Academy', url: 'https://academy.langchain.com/', type: 'video' }
        ],
        quizzes: [
          {
            question: 'What does the "ReAct" framework stand for in AI agent design?',
            options: [
              'Reacting to user interface clicks',
              'Reasoning and Acting',
              'Recursive Action',
              'Reinforcement Active learning'
            ],
            correctIndex: 1,
            explanation: 'ReAct combines "Reasoning" (generating thoughts about what to do next) and "Acting" (executing actions like calling tools or search engines) in an alternating loop.'
          }
        ]
      }
    ]
  },
  'mlops': {
    id: 'mlops',
    title: 'MLOps',
    description: 'Operationalize models. Bridge the gap between data science and production with automated pipelines and robust CI/CD.',
    icon: 'deployed_code',
    color: 'secondary',
    tags: ['Docker', 'CI/CD', 'Pipelines'],
    connections: [
      { from: 'foundations', to: 'docker', type: 'solid' },
      { from: 'docker', to: 'cicd', type: 'solid' },
      { from: 'cicd', to: 'pipelines', type: 'solid' }
    ],
    nodes: [
      {
        id: 'foundations',
        title: 'Foundations',
        subtitle: 'Python & Git Basics',
        description: 'Understand version control, package management, and basic software engineering practices.',
        icon: 'code',
        prerequisites: [],
        skills: ['Git Branching', 'Virtual Environments', 'Unit Testing', 'GitHub Actions'],
        resources: [
          { title: 'Missing Semester of Your CS Education', url: 'https://missing.csail.mit.edu/', type: 'video' }
        ],
        quizzes: [
          {
            question: 'What is the purpose of a git merge conflict?',
            options: [
              'A bug in git that deletes code',
              'An indicator that changes in different branches overlap and must be resolved manually',
              'A command to delete a branch',
              'None of the above'
            ],
            correctIndex: 1,
            explanation: 'A merge conflict occurs when git cannot automatically reconcile differences between two commits, requiring manual intervention to decide which code to keep.'
          }
        ]
      },
      {
        id: 'docker',
        title: 'Docker',
        subtitle: 'Containers',
        description: 'Package your models, code, and dependencies into lightweight, portable containers that run anywhere.',
        icon: 'terminal',
        prerequisites: ['foundations'],
        skills: ['Dockerfile Writing', 'Container Lifecycle', 'Docker Compose', 'Multi-stage Builds'],
        resources: [
          { title: 'Docker Curriculum', url: 'https://docker-curriculum.com/', type: 'doc' }
        ],
        quizzes: [
          {
            question: 'What is the difference between a Docker Image and a Docker Container?',
            options: [
              'An image is a running instance of a container',
              'An image is a read-only blueprint; a container is a running instance of an image',
              'Images are only for databases; containers are for code',
              'There is no difference'
            ],
            correctIndex: 1,
            explanation: 'A Docker Image is a static, read-only template containing the application code and dependencies. A Docker Container is a running, writeable instance of that image.'
          }
        ]
      },
      {
        id: 'cicd',
        title: 'CI/CD Pipelines',
        subtitle: 'Automated Testing',
        description: 'Automate the testing, building, and deployment of your machine learning models and API endpoints.',
        icon: 'published_with_changes',
        prerequisites: ['docker'],
        skills: ['GitHub Actions', 'Model Testing', 'Linting & Formatting', 'Automated Releases'],
        resources: [
          { title: 'CI/CD for Machine Learning (CD4ML)', url: 'https://martinfowler.com/articles/cd4ml.html', type: 'article' }
        ],
        quizzes: [
          {
            question: 'What is the primary goal of Continuous Integration (CI)?',
            options: [
              'Deploying code directly to production customers',
              'Frequently merging code changes into a central repository, where automated builds and tests are run',
              'Writing code using AI',
              'Backing up databases'
            ],
            correctIndex: 1,
            explanation: 'Continuous Integration focuses on automating the integration of code changes from multiple contributors, running tests automatically to catch bugs early.'
          }
        ]
      },
      {
        id: 'pipelines',
        title: 'ML Pipelines',
        subtitle: 'Orchestration',
        description: 'Train models and track metadata automatically. Learn Kubeflow, MLflow, and feature stores.',
        icon: 'settings_suggest',
        prerequisites: ['cicd'],
        skills: ['MLflow Tracking', 'Feature Stores (Feast)', 'Pipeline DAGs', 'Model Drift Detection'],
        resources: [
          { title: 'MLflow Documentation', url: 'https://mlflow.org/docs/latest/index.html', type: 'doc' }
        ],
        quizzes: [
          {
            question: 'What is "Data Drift" in machine learning operations?',
            options: [
              'Moving databases from one cloud to another',
              'The change in the statistical properties of input data over time, which can degrade model performance',
              'A database backup process',
              'An error in data ingestion'
            ],
            correctIndex: 1,
            explanation: 'Data Drift occurs when the statistical distribution of the feature data in production changes relative to the training dataset, which can cause model accuracy to decline.'
          }
        ]
      }
    ]
  }
};
