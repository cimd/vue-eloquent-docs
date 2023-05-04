# Getting Started

## Motivation

The relationship between data, component states, and the actions that affect them is a fundamental and unavoidable 
layer to manage when building a component or application. Vue does not provide a way to structure and encapsulate
data, so most projects use plain objects and implement their own patterns to communicate with the server. 
This is perfectly fine for small applications, but can quickly become a lot to manage when the size of your 
project and team increases.

Dan Abramov (creator of ReactJS) wrote an interesting article on the [Presentational and Container Components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0) 
Pattern in JavaScript which separates data management from presentation logic. 
The Container component manages the data and state of the application, while the Presentation component renders 
the UI based on the data received from the Container component. This pattern promotes modularity, scalability, 
and reusability of presentation components across different Container components. By separating concerns, 
developers can create maintainable and scalable code.

This library provides that for you and using a well-designed and polished API used in Laravel.

The basic concept is that of a `Model` and a `Collection` of models. Data and component state is managed 
automatically, and CRUD is built-in. A classic example would be a *posts* list, where each post would be a 
model and the list of posts would be a collection.


### Objectives

1. Abstract the business logic out of the Vue pages and into Object Classes: Container/Presentation pattern
2. Use Laravel known methods to manage your Container Classes
3. Use a JSON API like interface

## Intro

This package comprises of two packages:
1. A Vue 3 package:

```sh
yarn add @konnec/vue-eloquent
```

2. A Laravel package:

```sh
composer require konnec/vue-eloquent-api
```

Installation and usage of both packages are described in these docs. They can be used together or independently.

## Architecture

![Architecture](/architecture.png)

## Inspiration

1. [vue-query](https://vue-query.vercel.app/): Vue Query package provides hooks for fetching, caching and updating asynchronous data in Vue
2. [Coloquent](https://github.com/DavidDuwaer/Coloquent): Javascript/Typescript library mapping objects and their interrelations to JSON API
3. [vue-mv](https://vuemc.io/): Models and Collections for Vue.js
4. [Presentational and Container Components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)
