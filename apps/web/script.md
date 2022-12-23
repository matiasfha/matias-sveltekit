The real power of Typescript can be unleashed when you start using conditional types.

Why?

Because this is the way you can implement type level algorithms to perform more complex tasks.
Using conditional types allows you to perform

- Pattern matching
- And Type Inference

If you combine that with all that you already now you can create pretty awesome tools


Let's  see how to create a simple query string parser at the type level using Conditional Types 

The first step is to create an utility type to extract the query string part of an string with the shape of an url

let's create a simple url string here that contains a set of query string variable

now let's define a new type ExtractQueryStringFromUrl that by using typeof will get the type literal value of the url variable

then, using the `extends` keyword we will create a condition for our conditional type 


by using a template literal we can describe the shape of what we need, a string that starts with https:// followed by any string then a question mark and any string 

if that condition match, return true or false otherwise

let's hover over the type to see the type returned, and is true.


Now, how to extract the query string part

This is known as type inference and can be done by using the `infer` keyword

This keyword can only be used as part of a conditional type and will create a *type variable* that we named QS 

let's return QS as part of the truthy side of the conditional and check what the type value returned is.

You can see that you succesfully extracted the query string from the url 

But this type is tied to the url variable, let's make it reusable.

The way Typescript allows you to create reusable code is by using Generics.

You can think on it as a type function that accepts an argument, in this case, named S 

let's return an error message in the falsy side of the condition 


and check that it works as expected by creating this two types

There you go, a type utility that can extract the query string side of an url string by using conditional types to perform pattern matching agains a string literal and type inference.

---

The next step is to identify what is the desired outcome

you already extracted this string, but you want to be able to split it into key/value pieces and then transform that into an object type

So, you need a wait to split the string literal,

Let's create a new type named SplitStr that by using conditional type will check if the string match with a certain pattern and return true or false, lets' check. It works!

Now let's extract the Key and Value parts using the infer keyword and return a new Record type with them, check again the result and there you go!, you got it.

Now, let's refactor this to be reusable by using two generic variables. The first one `S` is the string to split and the second one is the `Separator` string.

Let's use this generic inside the template literal, you see an error on the Separator because is not constrained as string, let's fix that and test this utility 

let's pass a string and the separator, it works as expected. If the string doesn't match it will return just the same string.

Let's rename this to explain better what it does.


--

So, you have this utility type to split a key=val string, but you still have the full string literal,

let's create another utility type to split that into sections and transform each section into an object 

ExtractQSParameters is equal to the string literal and let's check if it match a teamplte literal and extract each side.

If is true, let's use the SplitToObj type to split the left side of the pattern that you named `Val` and return `never`otherwise 

Let's fix this missing equal sign 

and check the result by hovering over the type name. Great, you got the first section of the query string as object type .

but there is more on that string right?

You can intersect the `Rest` section and check what the return value is, an object with a string.

So you need a way to repeat the process with the string that is inside the `Rest` type variable 

so the first attempt will be to replicate the same logic again but this immediately feels wrong right?

Is not reusable at all and is hard to read

What you do when you want reusable code? Use a generic 
let's pass a Generic named S, and replace the string with it 

Now let's go back to the previous usage of SplitToObj and test the result, all god but only once part of the string

if you append the `Rest` type variable you go the object type and the string as result.

How to execute the same operation?

By usining recursiveness. Loops in typescript are done by using recursion.
Apply ExtractQSParameters over Rest type variable and add an exit case by returning SplitToObj in case the string doesnt match anymore

Check tghe test and yeah! It works

There is an intersection of 3 record types, on for each section of the  query string 


But that doesn't looks like our goal, a type object, how can you achieve that?

You nee a way to merge two object or records into one object type

Let's create another utility type to acommplish exactly that

Let's named Merge that will take two generic variables O and T and will return an object type,

Now, let's use another advanced pattern of Typescript.

Mapped types, this is basically a way to iterate over a type and create another one from it, same idea as Javascript Array.map 

here we say that 
for each K inside the properties of the object O

or 
for each K inside the properties of the object T 

let's assign that key to be some value, what value?

If K is part of the properties of O then the value will be O[K]

if K is part of the properties of T then the value will be O[T]

if K is not part of anything, the value will be never

This type will iterate over all the properties of the object O and T
and will assign to each of that properties the corresponding value 

thus creating a new object of the merge of both objects.

Let's use this utility type on the main type here 

and check the result 


How to use this?

let's imaging you have a function named handleParams that will accept a string as generic and the argument of this function can only be an object with the shape of the query string parameters as object type.

Let's see how it works

pass a valid url string as generic so the paramters can only be the extraction of that.

if you pass different value or more paramters it will show an error

And there you go, the power of conditional types on typescript using template literal pattern matching and type inference.

