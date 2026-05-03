function step1() {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log("Step 1 completed");
            resolve();
        }, 1000);
    });
}

function second() {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve("Second function resolved.");
        }, 1000);
    });
}

function main() {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve("Main function resolved.");
        }, 1000);
    });
}

main()
    .then(result => {
        console.log(result);
        return step1();
    })
    .then(() => second())
    .then(result => {
        console.log(result);
    })
    .catch(err => {
        console.error(err);
    });
