/**
 * GraphQL client service for flexible queries.
 */
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { AuthService } from '@/app/(auth)/services/auth';

// HTTP link
const httpLink = createHttpLink({
  uri: '/backend/graphql/',
});

// Auth link to add JWT token
const authLink = setContext((_, { headers }) => {
  const token = AuthService.getAuthToken();
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

// Error link for handling errors
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`GraphQL network error: ${networkError}`);
    
    // Handle 401 errors by redirecting to login
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      AuthService.logout();
      window.location.href = '/login';
    }
  }
});

// Create Apollo client
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          projects: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          flashcardSets: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          flashcards: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

// GraphQL queries
export const GET_PROJECTS = `
  query GetProjects {
    projects {
      edges {
        node {
          id
          name
          type
          description
          createdAt
          updatedAt
          owner {
            id
            email
          }
        }
      }
    }
  }
`;

export const GET_PROJECT_DETAIL = `
  query GetProjectDetail($id: ID!) {
    projectDetail(id: $id) {
      project {
        id
        name
        type
        description
        createdAt
        updatedAt
      }
      files {
        id
        filename
        uploadedAt
        fileSize
      }
      flashcardSets {
        id
        title
        description
        createdAt
        flashcards {
          id
          question
          answer
          difficulty
          nextReview
        }
      }
      studyStats {
        totalCards
        reviewedToday
        dueCards
        studyStreak
        completionRate
        cardsByDifficulty
      }
      recentReflections {
        id
        title
        content
        createdAt
      }
    }
  }
`;

export const GET_STUDY_STATS = `
  query GetStudyStats {
    studyStats {
      totalCards
      reviewedToday
      dueCards
      studyStreak
      completionRate
      cardsByDifficulty
    }
  }
`;

export const GET_DUE_CARDS = `
  query GetDueCards {
    dueCards {
      id
      question
      answer
      difficulty
      nextReview
      flashcardSet {
        id
        title
        project {
          id
          name
        }
      }
    }
  }
`;

// GraphQL mutations
export const CREATE_PROJECT = `
  mutation CreateProject($name: String!, $projectType: String!, $description: String) {
    createProject(input: {
      name: $name
      projectType: $projectType
      description: $description
    }) {
      project {
        id
        name
        type
        description
        createdAt
      }
      success
      errors
    }
  }
`;

export const REVIEW_FLASHCARD = `
  mutation ReviewFlashcard($flashcardId: ID!, $rating: Int!) {
    reviewFlashcard(input: {
      flashcardId: $flashcardId
      rating: $rating
    }) {
      flashcard {
        id
        difficulty
        nextReview
        lastReviewed
      }
      success
      errors
    }
  }
`;

// Utility functions
export const graphqlService = {
  /**
   * Execute a GraphQL query
   */
  async query(query: string, variables?: any) {
    try {
      const result = await apolloClient.query({
        query: gql(query),
        variables,
        fetchPolicy: 'cache-first',
      });
      return result.data;
    } catch (error) {
      console.error('GraphQL query error:', error);
      throw error;
    }
  },

  /**
   * Execute a GraphQL mutation
   */
  async mutate(mutation: string, variables?: any) {
    try {
      const result = await apolloClient.mutate({
        mutation: gql(mutation),
        variables,
      });
      return result.data;
    } catch (error) {
      console.error('GraphQL mutation error:', error);
      throw error;
    }
  },

  /**
   * Subscribe to GraphQL subscription (if implemented)
   */
  subscribe(subscription: string, variables?: any) {
    return apolloClient.subscribe({
      query: gql(subscription),
      variables,
    });
  },

  /**
   * Clear Apollo cache
   */
  clearCache() {
    apolloClient.clearStore();
  },

  /**
   * Reset Apollo cache
   */
  resetCache() {
    apolloClient.resetStore();
  },
};

// Helper function to create gql template literal
function gql(strings: TemplateStringsArray, ...values: any[]): any {
  return strings.join('');
}
