async function getData() {
    let res = await fetch('http://localhost:3000/posts');
    let data = await res.json();
    let body = document.getElementById('body-table');
    body.innerHTML = '';
    for (const product of data) {
        body.innerHTML += `
       <tr>
            <td>${product.id}</td>
            <td>${product.title}</td>
            <td>${product.views}</td>
            <td><input type='submit' value='delete' onclick='Delete(${product.id})'/></td>
       </tr>`
    }
}
async function Save() {
    let id = document.getElementById('txt_id').value;
    let title = document.getElementById('txt_title').value;
    let views = document.getElementById('txt_views').value;
    if (id == '') {
        let res = await fetch('http://localhost:3000/posts');
        let data = await res.json();
        let ids = data.map(function (e) {
            return Number.parseInt(e.id)
        })
        let max = Math.max(...ids);
        id = (max + 1) + "";
    }
    let getItem = await fetch('http://localhost:3000/posts/' + id);
    if (getItem.ok) {
        let res = await fetch('http://localhost:3000/posts/' + id,
            {
                method: 'PUT',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(
                    {
                        title: title,
                        views: views
                    }
                )
            }
        )
        if (res.ok) {
            console.log("thanh cong");
        }
    } else {
        let res = await fetch('http://localhost:3000/posts',
            {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(
                    {
                        id: id,
                        title: title,
                        views: views
                    }
                )
            }
        )
        if (res.ok) {
            console.log("thanh cong");
        }
    }
}
async function Delete(id) {
    let res = await fetch('http://localhost:3000/posts/' + id, {
        method: 'delete'
    })
    if (res.ok) {
        console.log("xoa thanh cong");
    }
}
getData();
