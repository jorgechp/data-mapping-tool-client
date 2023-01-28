# Data Mapping Tool

This repository is the `fronted` part of the Data Mapping Tool Project. You can check the back-end side at https://github.com/jorgechp/data-mapping-tool-api 

This part uses `React.js` + `Typescript` to
develop the user's visual interface to interact with our [API](https://github.com/elskater98/data-mapping-tool-api).
Furthermore, the project aims to make the process of mapping data using a single ontology or multiple ones. In our case,
the the project uses the BIGG ontology as background.

![image](https://user-images.githubusercontent.com/45320338/159911349-a4016560-afd1-43cd-b022-609797a0eea9.png)

## Getting Started

### Prerequisite

- `npm 8.1.0` or latest
- `node 16.13.0` or latest

### Install Dependencies
To install all the dependencies of the project, you should run the following command:

    npm install

### Run Project
    npm start

### File format: .env
    REACT_APP_API_URL=http://localhost:8080
    REACT_APP_DEFAULT_ONTOLOGY_ID=<str:id>
    WDS_SOCKET_PORT=0
