# Getting Started

## Motivation

The relationship between data, component states, and the actions that affect them is a fundamental and unavoidable 
layer to manage when building a component or application. Vue does not provide a way to structure and encapsulate
data, so most projects use plain objects and implement their own patterns to communicate with the server. 
This is perfectly fine for small applications, but can quickly become a lot to manage when the size of your 
project and team increases.

This library provides that for you and using a well-designed and polished API used in Laravel.

The basic concept is that of a `Model` and a `Collection` of models. Data and component state is managed 
automatically, and CRUD is built-in. A classic example would be a *posts* list, where each post would be a 
model and the list of posts would be a collection.



### Objectives

1. Abstract the business logic out of the Vue pages and into Object Classes
2. Use Laravel known methods into to manage your Vue classes
3. Use JSON API like interface

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
