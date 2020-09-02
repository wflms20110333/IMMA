package com.example.browserbugandroid.ui.studio;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.Observer;
import androidx.lifecycle.ViewModelProviders;

import com.example.browserbugandroid.AboutActivity;
import com.example.browserbugandroid.NotifActivity;
import com.example.browserbugandroid.R;

public class StudioFragment extends Fragment {

    private StudioViewModel studioViewModel;

    public View onCreateView(@NonNull LayoutInflater inflater,
            ViewGroup container, Bundle savedInstanceState) {
        studioViewModel =
                ViewModelProviders.of(this).get(StudioViewModel.class);
        View root = inflater.inflate(R.layout.fragment_studio, container, false);

        Log.i("StudioFragment.java", "========== fragment run ==========");

        /*final TextView textView = root.findViewById(R.id.text_slideshow);
        studioViewModel.getText().observe(getViewLifecycleOwner(), new Observer<String>() {
            @Override
            public void onChanged(@Nullable String s) {
                textView.setText(s);
            }
        });*/
        Log.i("StudioFragment.java", "========== fragment run done ==========");
        return root;
    }

}