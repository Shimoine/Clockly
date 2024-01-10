import Button from 'react-bootstrap/Button';

function GoogleAuth() {
    fetch( "http://localhost:4567/authorize")
        .then( response => response.json() )
        .then( json =>  {
            window.location.href = json
        });
}

function PageOfSettings() {
    return (
        <div>
            <h1>設定</h1>
            <Button variant="outline-success" onClick={GoogleAuth}>
                Google Calendar を認証
            </Button>
        </div>
    );
}
export default PageOfSettings;
