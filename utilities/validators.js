export const userValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["username", "password", "firstName", "lastName", "email", "telephone", "birthday", "address", "address_de", "languages", "languages_de", "profession", "profession_de", "gitHub", "avatar", "lastLoginTimestamp"],
    properties: {
      username: { bsonType: "string", minLength: 1 },
      password: { bsonType: "string", minLength: 1 },
      firstName: { bsonType: "string" },
      lastName: { bsonType: "string" },
      email: { bsonType: "string" },
      telephone: { bsonType: "number", minLength: 1 },
      birthday: { bsonType: "number", minLength: 1 },
      address: { bsonType: "string" },
      address_de: { bsonType: "string" },
      languages: { bsonType: "string" },
      languages_de: { bsonType: "string" },
      profession: { bsonType: "string" },
      profession_de: { bsonType: "string" },
      gitHub: { bsonType: "string" },
      avatar: { 
        bsonType: "object",
        required: ["name", "mimeType", "src"],
        properties: {
          name: { bsonType: "string", minLength: 1 },
          mimeType: { bsonType: "string", minLength: 1, enum: ["image/png", "image/jpg", "image/jpeg"] },
          src: { bsonType: "string", minLength: 1 }
        }
      },
      lastLoginTimestamp: { bsonType: "number", minLength: 1 }
    }
  }
};

export const tfaValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["userId", "isEnabled", "secret"],
    properties: {
      userId: { bsonType: "string", minLength: 1 },
      isEnabled: { bsonType: "bool" },
      secret: { bsonType: "string" }
    }
  }
};

export const skillValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["title", "type", "logo", "timestamp"],
    properties: {
      title: { bsonType: "string", minLength: 1 },
      type: { bsonType: "string", minLength: 1, enum: ["Language", "Framework", "Technology"] },
      logo: { 
        bsonType: "object",
        required: ["name", "mimeType", "src"],
        properties: {
          name: { bsonType: "string", minLength: 1 },
          mimeType: { bsonType: "string", minLength: 1, enum: ["image/png", "image/jpg", "image/jpeg"] },
          src: { bsonType: "string", minLength: 1 }
        }
      },
      timestamp: { bsonType: "number", minLength: 1 }
    }
  }
};

export const resumeItemValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["title", "title_de", "workplace", "duration", "duration_de", "description", "description_de", "type", "timestamp"],
    properties: {
      title: { bsonType: "string", minLength: 1 },
      title_de: { bsonType: "string", minLength: 1 },
      workplace: { bsonType: "string", minLength: 1 },
      duration: { bsonType: "string", minLength: 1 },
      duration_de: { bsonType: "string", minLength: 1 },
      description: { bsonType: "string", minLength: 1 },
      description_de: { bsonType: "string", minLength: 1 },
      type: { bsonType: "string", minLength: 1, enum: ["Education", "Experience"] },
      timestamp: { bsonType: "number", minLength: 1 }
    }
  }
};

export const portfolioItemValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["title", "link", "type", "logo", "timestamp"],
    properties: {
      title: { bsonType: "string", minLength: 1 },
      link: { bsonType: "string" },
      type: { bsonType: "string", minLength: 1, enum: ["Work", "Personal", "Academic"] },
      logo: { 
        bsonType: "object",
        required: ["name", "mimeType", "src"],
        properties: {
          name: { bsonType: "string", minLength: 1 },
          mimeType: { bsonType: "string", minLength: 1, enum: ["image/png", "image/jpg", "image/jpeg"] },
          src: { bsonType: "string", minLength: 1 }
        }
      },
      timestamp: { bsonType: "number", minLength: 1 }
    }
  }
};

export const certificationValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["title", "logo", "timestamp"],
    properties: {
      title: { bsonType: "string", minLength: 1 },
      logo: { 
        bsonType: "object",
        required: ["name", "mimeType", "src"],
        properties: {
          name: { bsonType: "string", minLength: 1 },
          mimeType: { bsonType: "string", minLength: 1, enum: ["image/png", "image/jpg", "image/jpeg"] },
          src: { bsonType: "string", minLength: 1 }
        }
      },
      timestamp: { bsonType: "number", minLength: 1 }
    }
  }
};

export const customerValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["title", "timestamp"],
    properties: {
      title: { bsonType: "string", minLength: 1 },
      timestamp: { bsonType: "number", minLength: 1 }
    }
  }
};

export const contactValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["name", "email", "subject", "message", "isGerman", "isAnswered", "timestamp"],
    properties: {
      name: { bsonType: "string", minLength: 1 },
      email: { bsonType: "string", minLength: 1, pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
      subject: { bsonType: "string", minLength: 1 },
      message: { bsonType: "string", minLength: 1 },
      isGerman: { bsonType: "bool" },
      isAnswered: { bsonType: "bool" },
      timestamp: { bsonType: "number", minLength: 1 }
    }
  }
};
