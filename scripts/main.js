const GITHUB_TOKEN = '';
const REPO_OWNER = 'TuniSwap';
const REPO_NAME = 'UserDB';
const FILE_PATH = 'Users/RegisterData.csv';
let FILE_CONTENT = ''; // Tel,Name,Email,Password,Refer
const COMMIT_MESSAGE = '';

async function uploadFileToGitHub() {
    try {
        // Step 1: Get the default branch (usually 'main')
        console.log('Step 1');
        const repoInfo = await makeGitHubRequest(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`,
            'GET'
        );
        const defaultBranch = repoInfo.default_branch;

        // Step 2: Get the latest commit SHA
        console.log('Step 2');
        const refResponse = await makeGitHubRequest(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads/${defaultBranch}`,
            'GET'
        );
        const latestCommitSha = refResponse.object.sha;

        // Step 2.1: Read old registered user data
        const getResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
            },
        });
        const data = await getResponse.json();
        const oldData = atob(data.content);
        console.log(oldData);

        // Step 3: Create a blob for the file content
        console.log('Step 3');
        FILE_CONTENT = document.getElementById("name").value + ',' + document.getElementById("email").value + ',' + document.getElementById("password").value + ',' + document.getElementById("referral").value;
        FILE_CONTENT = oldData + '\n' + FILE_CONTENT;
        console.log(FILE_CONTENT);
        const blobResponse = await makeGitHubRequest(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/blobs`,
            'POST', {
            content: btoa(FILE_CONTENT), // Encode content in base64
            encoding: 'base64',
        }
        );
        const blobSha = blobResponse.sha;

        // Step 4: Create a tree with the new file
        console.log('Step 4')
        const treeResponse = await makeGitHubRequest(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees`,
            'POST', {
            base_tree: latestCommitSha,
            tree: [{
                path: FILE_PATH,
                mode: '100644', // File mode (100644 for a normal file)
                type: 'blob',
                sha: blobSha,
            },],
        }
        );
        const treeSha = treeResponse.sha;

        // Step 5: Create a new commit
        console.log('Step 5')
        const commitResponse = await makeGitHubRequest(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/commits`,
            'POST', {
            message: 'Register new user => ' + document.getElementById("name").value,
            tree: treeSha,
            parents: [latestCommitSha],
        }
        );
        const newCommitSha = commitResponse.sha;

        // Step 6: Update the branch reference to the new commit
        console.log('Step 6')
        await makeGitHubRequest(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads/${defaultBranch}`,
            'PATCH', {
            sha: newCommitSha,
            force: false,
        }
        );

        console.log('File uploaded successfully!');
    } catch (error) {
        console.error('Error uploading file:', error);
    }
}

// Helper function to make API requests
async function makeGitHubRequest(url, method, body = null) {
    const headers = {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response.json();
}

async function getFileContent() {
    try {
        const getResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
            },
        });

        if (getResponse.ok) {
            const data = await getResponse.json();
            const currentContent = atob(data.content);
            const updatedContent = currentContent + '\nnewData';
            console.log(`updatedContent ${updatedContent}`);

            const putResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
                method: 'PUT',
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Update form data',
                    content: btoa(updatedContent),
                    sha: data.sha,
                }),
            });

            if (putResponse.ok) {
                //document.getElementById('output').innerText = 'Data updated successfully!';
            } else {
                //document.getElementById('output').innerText = 'Error updating data in GitHub.';
            }
        } else {
            //document.getElementById('output').innerText = 'Error fetching file content.';
        }
    } catch (error) {
        console.error('Error:', error);
        //document.getElementById('output').innerText = 'Error updating data in GitHub.';
    }
}
