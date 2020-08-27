package com.example.browserbugandroid;

import android.content.Intent;
import android.os.Bundle;

import com.example.browserbugandroid.ui.login.LoginActivity;
import com.google.android.material.appbar.CollapsingToolbarLayout;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.snackbar.Snackbar;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import android.view.View;
import android.widget.Toast;

public class AboutActivity extends AppCompatActivity {

    private String username;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_about);

        // Get the Intent that started this activity and extract the string
        Intent intent = getIntent();
        username = intent.getStringExtra(LoginActivity.USERNAME_MESSAGE);
//        String welcome = getString(R.string.welcome) + username;
//        Toast.makeText(getApplicationContext(), welcome, Toast.LENGTH_LONG).show();

        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        CollapsingToolbarLayout toolBarLayout = (CollapsingToolbarLayout) findViewById(R.id.toolbar_layout);
//        toolBarLayout.setTitle(getString(R.string.about_title));

        FloatingActionButton fab = (FloatingActionButton) findViewById(R.id.fab);
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Snackbar.make(view, "Replace with your own action", Snackbar.LENGTH_LONG)
                        .setAction("Action", null).show();
            }
        });
    }

    /** Called when the user taps the back button */
    public void back(View view) {
        if (username.length() == 0) {
            // return to login screen
            Intent intent = new Intent(this, LoginActivity.class);
            startActivity(intent);
        }
        // TODO: return to main page
    }
}